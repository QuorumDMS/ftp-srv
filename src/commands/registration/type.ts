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

export const type = {
  directive: 'TYPE',
  handler: function (data) {
    if (/^A[0-9]?$/i.test(data.command.arg)) {
      this.transferType = 'ascii';
    } else if (/^L[0-9]?$/i.test(data.command.arg) || /^I$/i.test(data.command.arg)) {
      this.transferType = 'binary';
    } else {
      return this.reply(501);
    }
    return this.reply(200, `Switch to "${this.transferType}" transfer mode.`);
  },
  syntax: '{{cmd}} <mode>',
  description: 'Set the transfer mode, binary (I) or ascii (A)',
  flags: {
    feat: 'TYPE A,I,L'
  }
};
