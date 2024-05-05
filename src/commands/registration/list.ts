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
import { get } from "lodash";
import { promiseTry } from "../../helpers/promise-util";
import { getFileStat } from "../../helpers/file-stat";

// http://cr.yp.to/ftp/list.html
// http://cr.yp.to/ftp/list/eplf.html
export const list = {
  directive: 'LIST',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');
    if (!this.fs.list) return this.reply(402, 'Not supported by file system');

    const simple = data.command.directive === 'NLST';

    const path = data.command.arg || '.';
    return this.connector.waitForConnection()
      .then(() => {
        return promiseTry(() => {
          return this.fs.get(path);
        });
      })
      .then((stat) => {
        if (stat.isDirectory()) {
          return promiseTry(() => {
            return this.fs.list(path);
          });
        } else {
          return [stat];
        }
      })
      .then((files) => {
        const getFileMessage = (file) => {
          if (simple) return file.name;
          return getFileStat(file, get(this, 'server.options.fileFormat', 'ls'));
        };
        return promiseTry(() => files.map((file) => {
          const message = getFileMessage(file);
          return { raw: true,
            message,
            socket: this.connector.socket
          };
        }));
      })
      .then((fileList) => {
        this.reply(150);
        return fileList;
      })
      .then((fileList) => {
        if (fileList.length) return this.reply({}, ...fileList);
        return this.reply({ socket: this.connector.socket, useEmptyMessage: true })
      })
      .then((data) => {
        this.reply(226);
        return data;
      })
      .catch((err) => {
        data.Log.error(err);
        return this.reply(425, 'No connection established');
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(451, err.message || 'No directory');
      })
      .then(() => {
        this.connector.end();
      });
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns information of a file or directory if specified, else information of the current working directory is returned'
};
