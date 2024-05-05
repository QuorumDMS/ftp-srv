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

import util from '@ohos.util';
import { promiseTry } from "../../helpers/promise-util";

export const retr = {
  directive: 'RETR',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.read) return this.reply(402, 'Not supported by file system');
    const filePath = data.command.arg;
    return this.connector.waitForConnection()
      .then(() => promiseTry(() => this.fs.read(filePath)))
      .then((fsResponse) => {
        let {stream, clientPath} = fsResponse;
        if (!stream && !clientPath) {
          stream = fsResponse;
          clientPath = filePath;
        }
        const serverPath = filePath;
        const eventsPromise = new Promise((resolve, reject) => {
          this.connector.socket.on('error', (err) => {
            reject(err);
          });
          let size = this.fs.size(filePath);
          let option = new StreamOption();
          option.offset = this.restByteCount;
          option.length = size;
          let buf = new ArrayBuffer(size);
          try {
            stream.readSync(buf, option);
            if (this.connector.socket) {
              let tcpSendOptions;
              if (this.connector.connection.secure) {


                let textDecoder = util.TextDecoder.create('utf-8', { ignoreBOM: false });
                let resultData = textDecoder.decodeWithStream(new Uint8Array(buf), { stream: false });
                tcpSendOptions = resultData;
              } else {
                tcpSendOptions =
                  {
                    data: buf
                  }
              }

              this.connector.socket.send(tcpSendOptions, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(null);
                }
              });

            }
          } catch (err) {
            this.connector.socket.close((err) => {
              if (err) {
                data.log.error(err);
                return;
              }
            })
            reject(err);
          }
        });


        this.restByteCount = 0;

        return this.reply(150)

          .then(() => eventsPromise)
          .then(() => this.emit('RETR', null, serverPath))
          .then(() => this.reply(226, clientPath))
          .then(() => stream && stream.close());
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(425, 'No connection established');
      })
      .catch((err) => {
        data.log.error(err);
        this.emit('RETR', err);
        return this.reply(551, err.message);
      })
      .then(() => {
        this.connector.end();
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Retrieve a copy of the file'
};

class StreamOption {
  offset: number = 0;
  length: number = 0;
}