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
import { toUpper } from "lodash";

export const prot = {
  directive: 'PROT',
  handler: function (data) {
    if (!this.secure) return this.reply(202, 'Not supported');
    if (!this.bufferSize && typeof this.bufferSize !== 'number') return this.reply(503);

    switch (toUpper(data.command.arg)) {
      case 'P':
        return this.reply(200, 'OK');
      case 'C':
      case 'S':
      case 'E':
        return this.reply(536, 'Not supported');
      default:
        return this.reply(504);
    }
  },
  syntax: '{{cmd}}',
  description: 'Data Channel Protection Level',
  flags: {
    no_auth: true,
    feat: 'PROT'
  }
};
