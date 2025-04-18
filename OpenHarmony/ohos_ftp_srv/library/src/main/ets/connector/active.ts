import { socket } from '@kit.NetworkKit';
import connection from '@ohos.net.connection';
import { Connector } from "./base";
import { SocketError } from "../errors";
import { promiseWithTimeout } from "../helpers/promise-util";

export class Active extends Connector {
  private dataSocketConnected = false;
  private dataSocketClose = false;

  constructor(connection) {
    super(connection);
    this.type = 'active';
  }

  waitForConnection({timeout = 5000, delay = 250} = {}) {
    const checkSocket = () => {
      if (this.dataSocket && this.dataSocketConnected) {
        return Promise.resolve(this.dataSocket);
      }
      return new Promise(resolve => setTimeout(resolve, delay))
        .then(() => checkSocket());
    };
    return promiseWithTimeout<never>(checkSocket(), timeout);
  }

  setupConnection(host, port, family = 1) {
    const closeExistingServer = () => Promise.resolve(
      this.dataSocket ?
      this.dataSocket.close().then(() => {
        this.dataSocketConnected = false;
        this.log.info('Active dataSocket close success');
      }).catch((err) => {
        this.log.error('Active dataSocket close fail');
      }) : undefined);
    return closeExistingServer()
      .then(async () => {
        let commandNetAddress = await this.connection.commandSocket.getRemoteAddress();
        if (!this.ipIsEqual(commandNetAddress.address, host)) {
          throw new SocketError('The given address is not yours', 500);
        }
        if (this.connection.secure) {
          this.dataSocket = socket.constructTLSSocketServerInstance()
        } else {
          this.dataSocket = socket.constructTCPSocketInstance()
        }

        if (this.connection.secure) {
        } else {
          connection.getDefaultNet().then((netHandle: connection.NetHandle) => {
            connection.getConnectionProperties(netHandle).then((data: connection.ConnectionProperties) => {
              let bindAddress: socket.NetAddress = {
                address: data.linkAddresses[0].address.address,
                port: data.linkAddresses[0].address.port
              }
              this.dataSocket.bind(bindAddress, (err) => {
                if (err) {
                  this.server && this.server.emit('client-error', {
                    connection: this.connection,
                    context: 'dataSocket',
                    error: err
                  });
                  return;
                }
                this.dataSocket.on('error', (err) => {
                  this.server && this.server.emit('client-error', {
                    connection: this.connection,
                    context: 'dataSocket',
                    error: err
                  });
                  this.dataSocketConnected = false;
                });

                let options: socket.TCPConnectOptions = {
                  address: {
                    address: host,
                    port: port
                  },
                  timeout: 6000
                }
                this.dataSocket.connect(options, (err) => {
                  if (err) {
                    this.server && this.server.emit('client-error', {
                      connection: this.connection,
                      context: 'dataSocket',
                      error: err
                    });
                    return;
                  }
                  this.dataSocketConnected = true;

                });
              })
            })

          });

        }
      }

      )
  }

  private ipIsEqual(ip1, ip2) {
    //去除可能存在的空格
    const cleanIp1 = ip1.replace(/\s/g, '');
    const cleanIp2 = ip2.replace(/\s/g, '');
    //比较两个清洁后的IP字符串是否相等
    return cleanIp1 === cleanIp2;
  }

  getDataSocketClose() {
    return this.dataSocketClose;
  }
}