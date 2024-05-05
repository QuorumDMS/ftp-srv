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
import { promiseTry, promiseMap } from "../../helpers/promise-util";
import { getFileStat } from "../../helpers/file-stat";

export const stat = {
  directive: 'STAT',
  handler: function (args = {}) {
    let path;
    if ('command' in args) {
      path = get(args.command, 'arg');
    }
    if (path) {
      if (!this.fs) return this.reply(550, 'File system not instantiated');
      if (!this.fs.get) return this.reply(402, 'Not supported by file system');

      return promiseTry(() => this.fs.get(path))
        .then((stat) => {
          if (stat.isDirectory()) {
            if (!this.fs.list) return this.reply(402, 'Not supported by file system');

            return promiseTry(() => this.fs.list(path))
              .then((stats) => [213, stats]);
          }
          return [212, [stat]];
        })
        .then(([code, fileStats]) => {
          return promiseMap(fileStats, (file) => {
            const message = getFileStat(file,get(this, 'server.options.fileFormat', 'ls'));
            return {
              raw: true,
              message
            };
          })
            .then((messages) => [code, messages]);
        })
        .then(([code, messages]) => this.reply(code, 'Status begin', ...messages, 'Status end'))
        .catch((err) => {
          return this.reply(450, err.message);
        });
    } else {
      return this.reply(211, 'Status OK');
    }
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns the current status'
};
