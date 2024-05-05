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

//@ts-ignore
import { concat, get } from "lodash";
import socket from '@ohos.net.socket';
import Url from '@ohos.url';
import { FtpConnection } from "./connection";
import { getNextPortFactory } from "./helpers/find-port";
import { Logger } from "./helpers/logger";
import { EventEmitter } from "./helpers/event-emitter";

export class FtpServer extends EventEmitter {
  private options;
  private _greeting;
  private _features;
  private connections;
  private log;
  private url;
  private server;
  getNextPasvPort;

  constructor(options = {}) {
    super();
    const rootLogger = new Logger('ftp-srv', 'info')
    this.options = Object.assign({
      log: rootLogger,
      url: 'ftp://127.0.0.1:21',
      pasvMin: 1024,
      pasvMax: 65535,
      pasvUrl: null,
      anonymous: false,
      fileFormat: 'ls',
      blacklist: [],
      whitelist: [],
      greeting: null,
      tls: false,
      timeout: 0
    }, options);

    this._greeting = this.setupGreeting(this.options.greeting);
    this._features = this.setupFeaturesMessage();

    delete this.options.greeting;

    this.connections = {};
    this.log = this.options.log;
    this.url = Url.URL.parseURL(this.options.url);
    this.getNextPasvPort = getNextPortFactory(
      get(this, 'url.hostname'),
      get(this, 'options.pasvMin'),
      get(this, 'options.pasvMax'));

    const timeout = Number(this.options.timeout);
    this.options.timeout = Number.isNaN(timeout) ? 0 : Number(timeout);
    if (this.isTLS) {
      this.server = socket.constructTLSSocketServerInstance();
    } else {
      this.server = socket.constructTCPSocketServerInstance()
    }

    this.server.on('error', (err) => {
      this.log.error(err, '[Event] error');
      this.emit('server-error', { error: err });
    });
  }

  get isTLS() {
    return this.url.protocol === 'ftps:' && this.options.tls;
  }

  listen() {
    if (!this.options.pasvUrl) {
      this.log.warn('Passive URL not set. Passive connections not available.');
    }
    const serverConnectionHandler = (data) => {
      let connection = new FtpConnection(this, { log: this.log, socket: data });
      this.connections[connection.id] = connection;
      data.on('close', async () => {
        this.emit('disconnect', {
          connection,
          id: connection.id,
          newConnectionCount: Object.keys(this.connections).length
        });
        await this.disconnectClient(connection.id)
      });
      this.emit('connect', { connection, id: connection.id, newConnectionCount: Object.keys(this.connections).length })
      const greeting = this._greeting || [];
      const features = this._features || 'Ready'
      return connection.reply(220, ...greeting, features)
        .then(() => {
        });
    };
    return new Promise((resolve: Function, reject: Function) => {
      this.server.on('error', (err) => {
        reject();
      });
      let connectOptions;
      if (this.isTLS) {
        let secureOptions = {
          protocols: [socket.Protocol.TLSv12,socket.Protocol.TLSv13],
          useRemoteCipherPrefer: true,
          signatureAlgorithms: "rsa_pss_rsae_sha256:ECDSA+SHA256",
          cipherSuite: "AES256-SHA256"
        }
        if (this.options.tls.ca) {
          secureOptions['ca'] = this.options.tls.ca
        }
        if (this.options.tls.key) {
          secureOptions['key'] = this.options.tls.key
        }
        if (this.options.tls.cert) {
          secureOptions['cert'] = this.options.tls.cert
        }
        if (this.options.tls.password) {
          secureOptions['password'] = this.options.tls.password
        }
        connectOptions = {
          address: {
            address: this.url.hostname,
            port: !!this.url.port ? Number.parseInt(this.url.port) : 21
          },
          secureOptions: secureOptions,
          ALPNProtocols: ["spdy/1", "http/1.1"]
        }
      } else {
        connectOptions = {
          address: this.url.hostname,
          port: !!this.url.port ? Number.parseInt(this.url.port) : 21,
          family: 1
        }
      }
      this.server.listen(connectOptions).then(() => {
        this.server.off('error');
        this.log.info({
          protocol: this.url.protocol.replace(/\W/g, ''),
          ip: this.url.hostname,
          port: !!this.url.port ? Number.parseInt(this.url.port) : 21
        }, 'Listening');
        let tcpExtraOptions = {
          keepAlive: true,
          OOBInline: true,
          TCPNoDelay: true,
          socketLinger: { on: true, linger: 10 },
          receiveBufferSize: 4096,
          sendBufferSize: 4096,
          reuseAddress: true,
          socketTimeout: 3000
        }
        this.server.setExtraOptions(tcpExtraOptions, (err) => {
          if (err) {
            return;
          }
          this.log.info({
            protocol: this.url.protocol.replace(/\W/g, ''),
            ip: this.url.hostname,
            port: !!this.url.port ? Number.parseInt(this.url.port) : 21
          }, 'setExtraOptions');
        })
        this.server.on('connect', serverConnectionHandler);
        resolve('Listening');
      }).catch((err) => {
        reject(err);
      })
    });
  }

  emitPromise(action, ...data) {
    return new Promise((resolve, reject) => {
      const params = concat(data, [resolve, reject]);
      this.emit.call(this, action, ...params);
    });
  }

  setupGreeting(greet) {
    if (!greet) return [];
    const greeting = Array.isArray(greet) ? greet : greet.split('\n');
    return greeting;
  }

  setupFeaturesMessage() {
    let features = [];
    if (this.options.anonymous) features.push('a');

    if (features.length) {
      features.unshift('Features:');
      features.push('.');
    }
    return features.length ? features.join(' ') : 'Ready';
  }

  async disconnectClient(id) {
    return new Promise((resolve, reject) => {
      const client = this.connections[id];
      if (!client) return resolve('Disconnected' + id + 'is not have');
      delete this.connections[id];

      setTimeout(() => {
        reject(new Error('Timed out disconnecting the client'))
      }, this.options.timeout || 1000)

      try {
        client.close(0);
      } catch (err) {
        this.log.error(err, 'Error closing connection', { id });
      }

      resolve('Disconnected');
    });
  }

  async quit() {
    return this.close()
  }

  async close() {
    this.emit('closing');
    this.log.info('Closing connections:', Object.keys(this.connections).length);
    this.removeAllListeners();
    return Promise.all(Object.keys(this.connections).map(async (id) => {
      await this.disconnectClient(id);
    }))
      .then(() => new Promise((resolve) => {
        this.log.info('Server closing...');
        resolve('Closed');
      }))
      .then(() => {
        this.log.debug('Removing event listeners...')
        this.emit('closed', {});
        return;
      });
  }
}

