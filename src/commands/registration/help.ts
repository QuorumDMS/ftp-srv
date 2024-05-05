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
import { upperCase, concat, chunk } from "lodash";
import { registry } from "../registry";

export const help = {
  directive: 'HELP',
  handler: function (data) {
    const directive = upperCase(data.command.arg);
    if (directive) {
      if (!registry.hasOwnProperty(directive)) return this.reply(502, `Unknown command ${directive}.`);

      const {syntax, description} = registry[directive];
      const reply = concat([syntax.replace('{{cmd}}', directive), description]);
      return this.reply(214, ...reply);
    } else {
      const supportedCommands = chunk(Object.keys(registry), 5).map((chunk) => chunk.join('\t'));
      return this.reply(211, 'Supported commands:', ...supportedCommands, 'Use "HELP [command]" for syntax help.');
    }
  },
  syntax: '{{cmd}} [<command>]',
  description: 'Returns usage documentation on a command if specified, else a general help document is returned',
  flags: {
    no_auth: true
  }
};
