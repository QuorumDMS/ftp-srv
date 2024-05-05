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

export const mdtm = {
    directive: 'MDTM',
    handler: function (data) {
        if (!this.fs) return this.reply(550, 'File system not instantiated');
        if (!this.fs.get) return this.reply(402, 'Not supported by file system');
        return promiseTry(() => this.fs.get(data.command.arg))
            .then((fileStat) => {
                let fileStatDate = new Date(fileStat.mtime);
                const mtime = new Date(Date.UTC(
                    fileStatDate.getUTCFullYear(),
                    fileStatDate.getUTCMonth(),
                    fileStatDate.getUTCDate(),
                    fileStatDate.getUTCHours(),
                    fileStatDate.getUTCMinutes(),
                    fileStatDate.getUTCSeconds(),
                    fileStatDate.getUTCMilliseconds()));
                const modificationTime = formatDate(mtime);
                return this.reply(213, modificationTime);
            })
            .catch((err) => {
                data.log.error(err);
                return this.reply(550, err.message);
            });
    },
    syntax: '{{cmd}} <path>',
    description: 'Return the last-modified time of a specified file',
    flags: {
        feat: 'MDTM'
    }
};

function formatDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    let milliseconds = date.getMilliseconds(); // 处理毫秒的小数部分，只取三位
    let sss = (milliseconds / 1000).toFixed(3).slice(2);
    return `${year}${month}${day}${hours}${minutes}${seconds}.${sss}`;
}