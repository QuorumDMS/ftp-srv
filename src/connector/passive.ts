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
import { Connector } from "./base";
import { ConnectorError } from "../errors";
import { promiseWithTimeout } from "../helpers/promise-util";


const CONNECT_TIMEOUT = 30 * 1000;

export class Passive extends Connector {
  private serverListening = false;
  private dataSocketConnected = false;
  private dataSocketClose = false;

  constructor(connection) {
    super(connection);
    this.type = 'passive';
  }

  waitForConnection({timeout = 5000, delay = 50} = {}) {
    if (!this.dataServer) return Promise.reject(new ConnectorError('Passive server not setup'));

    const checkSocket = () => {
      if (this.dataServer && this.serverListening && this.dataSocket && this.dataSocketConnected) {
        return Promise.resolve(this.dataSocket);
      }
      return new Promise(resolve => setTimeout(resolve, delay))
        .then(() => checkSocket());
    };

    return promiseWithTimeout<never>(checkSocket(), timeout);
  }

  setupServer() {
    if (this.dataServer) {
      this.closeServer();
      this.serverListening = false;
      this.dataSocketConnected = false;
      this.dataSocketClose = false;
    }
    return this.server.getNextPasvPort()
      .then((port) => {
        this.dataSocket = null;
        let idleServerTimeout;
        const connectionHandler = async (socket) => {
          let commandNetAddress = await this.connection.commandSocket.getRemoteAddress();
          let socketNetAddress = await socket.getRemoteAddress();
          if (!this.ipIsEqual(commandNetAddress.address, socketNetAddress.address)) {
            this.log.error({
              pasv_connection: socketNetAddress.address,
              cmd_connection: commandNetAddress.address
            }, 'Connecting addresses do not match');
            await socket.close();
            return this.connection.reply(550, 'Remote addresses do not match')
              .then(() => this.connection.close());
          }
          clearTimeout(idleServerTimeout);
          this.log.trace({
            port,
            remoteAddress: socketNetAddress.address
          }, 'Passive connection fulfilled.');
          this.dataSocket = socket;
          this.dataSocketConnected = true;
          this.dataSocketClose = false;
          this.dataSocket.on('close', () => {
            this.log.trace('Passive server closed');
            this.dataSocketConnected = false;
            this.serverListening = false;
            this.dataSocketClose = true;
            this.closeServer();
          });
          this.dataSocket.on('error', (err) => {
            this.server && this.server.emit('client-error', {
              connection: this.connection,
              context: 'dataSocket',
              error: err
            })
          });
        };
        let options;
        if (this.connection.secure) {
          this.dataServer = socket.constructTLSSocketServerInstance();
          let secureOptions = {
            protocols: [socket.Protocol.TLSv12,socket.Protocol.TLSv13],
            useRemoteCipherPrefer: true,
            signatureAlgorithms: "rsa_pss_rsae_sha256:ECDSA+SHA256",
            cipherSuite: "AES256-SHA256"
          }
          if (this.server.options.tls.ca) {
            secureOptions['ca'] = this.server.options.tls.ca
          }
          if (this.server.options.tls.key) {
            secureOptions['key'] = this.server.options.tls.key
          }
          if (this.server.options.tls.cert) {
            secureOptions['cert'] = this.server.options.tls.cert
          }
          if (this.server.options.tls.password) {
            secureOptions['password'] = this.server.options.tls.password
          }
          options = {
            address: {
              address: this.server.url.hostname,
              port: port
            },
            secureOptions: secureOptions,
            ALPNProtocols: ["spdy/1", "http/1.1"]
          }
        } else {
          this.dataServer = socket.constructTCPSocketServerInstance();
          options = {
            address: this.server.url.hostname,
            port: port,
            family: 1
          }
        }

        return new Promise((resolve, reject) => {
          this.dataServer.listen(options, (err) => {
            if (err) {
              reject(err);
            } else {
              this.serverListening = true;
              idleServerTimeout = setTimeout(() => {
                this.closeServer();
              }, CONNECT_TIMEOUT);
              this.log.debug({ port }, 'Passive connection listening');
              this.dataServer.on('connect', connectionHandler);
              this.dataServer.on('error', (err) => {
                this.server && this.server.emit('client-error', {
                  connection: this.connection,
                  context: 'dataServer',
                  error: err
                })
              });
              resolve(port);
            }
          });
        });
      })
      .catch((error) => {
        this.log.trace(error.message);
        throw error;
      });
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
