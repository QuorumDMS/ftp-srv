/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import socket from '@ohos.net.socket';
import connection from '@ohos.net.connection';
import { Connector } from "./base";
import { SocketError } from "../errors";
import { promiseWithTimeout } from "../helpers/promise-util";

export class Active extends Connector {
  private dataSocketConnected = false;

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
}