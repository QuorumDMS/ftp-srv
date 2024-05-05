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
import { upperCase } from "lodash";

export const auth = {
  directive: 'AUTH',
  handler: function (data) {
    const method = upperCase(data.command.arg);

    switch (method) {
    // case 'TLS':
    //   return handleTLS.call(this);
      default:
        return this.reply(504);
    }
  },
  syntax: '{{cmd}} <type>',
  description: 'Set authentication mechanism',
  flags: {
    no_auth: true,
    feat: 'AUTH TLS'
  }
};

// function handleTLS() {
//   if (!this.server.options.tls) return this.reply(502);
//   if (this.secure) return this.reply(202);
//
//   return this.reply(234)
//     .then(() => {
//       const secureContext = tls.createSecureContext(this.server.options.tls);
//       const secureSocket = new tls.TLSSocket(this.commandSocket, {
//         isServer: true,
//         secureContext
//       });
//       ['data', 'timeout', 'end', 'close', 'drain', 'error'].forEach((event) => {
//
//         function forwardEvent() {
//           this.emit.apply(this, arguments);
//         }
//
//         secureSocket.on(event, forwardEvent.bind(this.commandSocket, event));
//       });
//       this.commandSocket = secureSocket;
//       this.secure = true;
//     });
// }
