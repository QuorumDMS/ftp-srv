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
import { has, toUpper, toLower } from "lodash";

const OPTIONS = {
  UTF8: utf8,
  'UTF-8': utf8
};

export const opts = {
  directive: 'OPTS',
  handler: function (data) {
    if (!has(data.command, 'arg')) return this.reply(501);

    const [_option, ...args] = data.command.arg.split(' ');
    const option = toUpper(_option);

    if (!OPTIONS.hasOwnProperty(option)) return this.reply(501, 'Unknown option command');
    return OPTIONS[option].call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Select options for a feature'
};

function utf8([setting] = []) {
  const getEncoding = () => {
    switch (
    toUpper(setting)) {
      case 'ON':
        return 'utf8';
      case 'OFF':
        return 'ascii';
      default:
        return null;
    }
  };

  const encoding = getEncoding();
  if (!encoding) return this.reply(501, 'Unknown setting for option');

  this.encoding = encoding;

  return this.reply(200, `UTF8 encoding ${toLower(setting)}`);
}
