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

import { Passive } from "../../connector/passive";

export const pasv = {
  directive: 'PASV',
  handler: function (data) {
    if (!this.server.options.pasvUrl) {
      return this.reply(502);
    }
    this.connector = new Passive(this);
    return this.connector.setupServer()
      .then(async (data) => {
        let port = data;
        let pasvAddress = this.server.options.pasvUrl;
        return { address: pasvAddress, port: port };
      })
      .then(({address, port}) => {
        const host = address.replace(/\./g, ',');
        const portByte1 = port / 256 | 0;
        const portByte2 = port % 256;
        return this.reply(227, `PASV OK (${host},${portByte1},${portByte2})`);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}}',
  description: 'Initiate passive mode'
};
