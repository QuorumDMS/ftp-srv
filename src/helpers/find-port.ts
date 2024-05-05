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

import { ConnectorError } from "../errors"

const MAX_PORT = 65535;
const MAX_PORT_CHECK_ATTEMPT = 5;

export function* portNumberGenerator(min, max = MAX_PORT) {
  let current = min;
  while (true) {
    if (current > MAX_PORT || current > max) {
      current = min;
    }
    yield current++;
  }
}

export function getNextPortFactory(host, portMin, portMax, maxAttempts = MAX_PORT_CHECK_ATTEMPT) {
  const nextPortNumber = portNumberGenerator(portMin, portMax);
  return () => new Promise((resolve, reject) => {
    const port = nextPortNumber.next().value;
    if (typeof port === 'number') {
      resolve(port);
    } else {
      reject(new ConnectorError('Unable to find valid port'));
    }
  });

}