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
import { concat, compact } from "lodash";
import util from '@ohos.util';
import { promiseTry, promiseMapSeries, promiseMap } from "./helpers/promise-util";
import { Connector } from "./connector/base";
import { FileSystem } from "./fs";
import { FtpCommands } from "./commands"
import { GeneralError, SocketError } from "./errors";
import { DEFAULT_MESSAGE } from "./messages";
import { EventEmitter } from "./helpers/event-emitter";

export class FtpConnection extends EventEmitter {
  id;
  server;
  commandSocket;
  log;
  commands;
  transferType;
  encoding;
  bufferSize;
  _restByteCount;
  _secure;
  connector;
  fs;
  authenticated;


  constructor(server, options) {
    super();
    this.server = server;
    this.id = util.generateRandomUUID(true)
    this.commandSocket = options.socket;
    this.log = options.log;
    this.log.info({ id: this.id })
    this.commands = new FtpCommands(this);
    this.transferType = 'binary';
    this.encoding = 'utf8';
    this.bufferSize = false;
    this._restByteCount = 0;
    this._secure = false;

    this.connector = new Connector(this);
    this.commandSocket.on('error', (err) => {
      this.log.error(err, 'Client error');
      this.server.emit('client-error', { connection: this, context: 'commandSocket', error: err });
    });
    this.commandSocket.on('message', this._handleData.bind(this));
    this.commandSocket.on('close', () => {
      if (this.connector) this.connector.end();
      this.removeAllListeners();
    });
  }


  _handleData(data) {
    let messageView = ''
    for (let i: number = 0; i < data.message.byteLength; i++) {
      let uint8Array = new Uint8Array(data.message);
      let messages = uint8Array[i];
      let message = String.fromCharCode(messages);
      messageView += message;
    }
    let messages = compact(messageView.split('\r\n'));
    this.log.trace(messages)
    return promiseMapSeries(messages, async (message) => this.commands.handle(message));
  }


  get restByteCount() {
    return this._restByteCount;
  }

  set restByteCount(rbc) {
    this._restByteCount = rbc;
  }

  get secure() {
    return this.server.isTLS || this._secure;
  }

  set secure(sec) {
    this._secure = sec;
  }

  close(code = 421, message = 'Closing connection') {
    return Promise.resolve(code)
      .then((_code) => _code && this.reply(_code, message))
      .then(() => {
        this.commandSocket && this.commandSocket.close().then(() => {
          this.log.info('close success');
        }).catch((err) => {
          this.log.error('close fail')
        })
      })
  }

  login(username, password) {
    return promiseTry(() => {
      const loginListeners = this.server.listeners('login');
      if (!loginListeners || !loginListeners.length) {
        if (!this.server.options.anonymous) throw new GeneralError('No "login" listener setup', 500);
      } else {
        return this.server.emitPromise('login', { connection: this, username, password });
      }
    })
      .then(({root, cwd, fs, blacklist = [], whitelist = []} = {}) => {
        this.authenticated = true;
        this.commands.blacklist = concat(this.commands.blacklist, blacklist);
        this.commands.whitelist = concat(this.commands.whitelist, whitelist);
        this.fs = fs || new FileSystem(this, root, cwd);
      });
  }

  reply(options, ...letters) {
    const satisfyParameters = () => {
      if (typeof options === 'number') options = { code: options }; // allow passing in code as first param
      if (!Array.isArray(letters)) letters = [letters];
      if (!letters.length) letters = [{}];
      return promiseMap(letters, (promise, index) => {
        return Promise.resolve(promise)
          .then((letter) => {
            if (!letter) letter = {};
            else if (typeof letter === 'string') letter = {
              message: letter
            }; // allow passing in message as first param

            if (!letter.socket) letter.socket = options.socket ? options.socket : this.commandSocket;
            if (!options.useEmptyMessage) {
              if (!letter.message) letter.message = DEFAULT_MESSAGE[options.code] || 'No information';
              if (!letter.encoding) letter.encoding = this.encoding;
            }
            return Promise.resolve(letter.message)// allow passing in a promise as a message
              .then((message) => {
                if (!options.useEmptyMessage) {
                  const seperator = !options.hasOwnProperty('eol') ?
                    letters.length - 1 === index ? ' ' : '-' :
                    options.eol ? ' ' : '-';
                  message = !letter.raw ? compact([letter.code || options.code, message]).join(seperator) : message;
                  letter.message = message;
                } else {
                  letter.message = '';
                }
                return letter;
              });
          });
      });
    };


    return satisfyParameters()
      .then((satisfiedLetters) => promiseMapSeries(satisfiedLetters, (letter) => {
        return new Promise((resolve, reject) => {
          if (!!letter.socket) {
            letter.socket.getRemoteAddress((err, data) => {
              if (err) {
                return;
              }
              this.log.trace({
                port: data.port,
                encoding: letter.encoding,
                message: letter.message
              }, 'Reply');
            })
            let tcpSendOptions;
            if (this.secure) {
              tcpSendOptions = letter.message + '\r\n';
            } else {
              tcpSendOptions = {
                data: letter.message + '\r\n'
              };
            }
            letter.socket.send(tcpSendOptions, (error) => {
              if (error) {
                this.log.error('[Process Letter] Socket Write Error', { error: error.message })
                return reject(error);
              }
              resolve('')
            })
          } else {
            this.log.trace({ message: letter.message }, 'Could not write message');
            reject(new SocketError('Socket not writable'))
          }
        });
      }))
      .catch((error) => {
        this.log.error('Satisfy Parameters Error', { error: error.message });
      });
  }
}

