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

import { beforeAll, describe, expect, it } from '@ohos/hypium';
import { Active } from '@ohos/ftp-srv/src/main/ets/connector/active';
import { getNextPortFactory } from '@ohos/ftp-srv/src/main/ets/helpers/find-port';
import { ACTIVE_MOCK_CONNECTION } from '../util';

export default function activesTest() {
  describe('activesTest', () => {
    const host = '127.0.0.1';
    let getNextPort = getNextPortFactory(host, 1024, 65535);
    let PORT: number;
    let active: Active;

    beforeAll(() => {
      active = new Active(ACTIVE_MOCK_CONNECTION);
      getNextPort()
        .then((port: number) => {
          PORT = port;
        });
    })

    it('sets up a connection', 0, () => {
      active.setupConnection(host, PORT).then(() => {
        expect(!!active.dataSocket).assertTrue();
      });
    })

    it('rejects alternative host', 0, () => {
      active.setupConnection('123.45.67.89', PORT)
        .then(() => {
          expect(!!!active.dataSocket).assertTrue();
        }).catch((err: ESObject) => {
        expect(err.code).assertEqual(500);
        expect(err.message).assertEqual('The given address is not yours');
      });
    })

    it('destroys existing connection, then sets up a connection', 0, () => {
      active.setupConnection(host, PORT)
        .then(() => {
          return active.setupConnection(host, PORT)
            .then(() => {
              expect(!!active.dataSocket).assertTrue();
            });
        });
    })

    it('waits for connection', 0, () => {
      active.setupConnection(host, PORT)
        .then((): Promise<ESObject> => {
          expect(!!active.dataSocket).assertTrue();
          return active.waitForConnection();
        })
        .then((dataSocket: ESObject) => {
          expect(dataSocket.connected).assertEqual(true);
        });
    })

  })
}