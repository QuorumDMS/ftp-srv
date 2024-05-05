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

import { promiseTry } from "../../helpers/promise-util";

export const stor = {
  directive: 'STOR',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.write) return this.reply(402, 'Not supported by file system');

    // const append = data.command.directive === 'APPE';
    const fileName = data.command.arg;
    return this.connector.waitForConnection()
      .then(() => promiseTry(() => this.fs.write(fileName)))
      .then((fsResponse) => {
        let {stream, clientPath} = fsResponse;
        if (!stream && !clientPath) {
          stream = fsResponse;
          clientPath = fileName;
        }
        const serverPath = fileName;
        const socketPromise = new Promise((resolve, reject) => {
          let offsetNumber = this.restByteCount;
          let intervalID;

          this.connector.socket.on('message', (value) => {
            if (!!!this.connector.socket) {
              return;
            }
            let option = new StreamOption();
            option.offset = offsetNumber;
            option.length = value.message.byteLength;
            try {
              let number = stream.writeSync(value.message, option);
              offsetNumber = offsetNumber + number;
            } catch (err) {
              data.log.error(err);
              this.connector.socket.close((err) => {
                if (err) {
                  data.log.error(err);
                  return;
                }
              })
              reject(err);
            }
            if (!intervalID) {
              intervalID = setInterval(() => {
                if (this.connector.getDataSocketClose()) {
                  clearInterval(intervalID);
                  resolve(null);
                }
              }, 120);
            } else {
              clearInterval(intervalID);
              intervalID = setInterval(() => {
                if (this.connector.getDataSocketClose()) {
                  clearInterval(intervalID);
                  resolve(null);
                }
              }, 120);
              ;
            }
          });
          this.connector.socket.on('error', (err) => {
            reject(err);
          });
        });
        this.restByteCount = 0;
        return this.reply(150)
          .then(() => socketPromise)
          .then(() => this.emit('STOR', null, serverPath))
          .then(() => this.reply(226, clientPath))
          .then(() => stream && stream.close());
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(425, 'No connection established');
      })
      .catch((err) => {
        data.log.error(err);
        this.emit('STOR', err);
        return this.reply(550, err.message);
      })
      .then(() => {
        this.connector.end();

      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Store data as a file at the server site'
};

class StreamOption {
  offset: number = 0;
  length: number = 0;
}
