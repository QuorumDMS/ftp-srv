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

import { Logger } from "@ohos/ftp-srv/src/main/ets/helpers/logger";
import { getNextPortFactory } from '@ohos/ftp-srv/src/main/ets/helpers/find-port';

export const STAT = {
  name: 'test1',
  dev: 2114,
  ino: 48064969,
  mode: 33279,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atime: 'Mon, 10 Oct 2017 23:24:11 GMT',
  mtime: 'Mon, 10 Oct 2017 23:24:11 GMT',
  ctime: 'Mon, 10 Oct 2017 23:24:11 GMT',
  birthtime: 'Mon, 10 Oct 2017 23:24:11 GMT',
  isDirectory: () => false
};

export const STAT_OLD = {
  name: 'test2',
  dev: 2114,
  ino: 48064969,
  mode: 33279,
  nlink: 1,
  uid: 84,
  gid: 101,
  rdev: 0,
  size: 530,
  blksize: 4096,
  blocks: 8,
  atime: 'Mon, 10 Oct 2011 14:05:12 GMT',
  mtime: 'Mon, 10 Oct 2011 14:05:12 GMT',
  ctime: 'Mon, 10 Oct 2011 14:05:12 GMT',
  birthtime: 'Mon, 10 Oct 2011 14:05:12 GMT',
  isDirectory: () => false
};

export const ACTIVE_MOCK_CONNECTION = {
  commandSocket: {
    getRemoteAddress: () => {
      return { address: '::ffff:127.0.0.1' };
    }
  }
};


export const PASSIVE_MOCK_CONNECTION = {
  reply: () => Promise.resolve({}),
  close: () => Promise.resolve({}),
  encoding: 'utf8',
  log: new Logger('ftp-srv', 'info'),
  commandSocket: {
    getRemoteAddress: () => {
      return { address: '::ffff:127.0.0.1' };
    }
  },
  server: {
    url: '',
    getNextPasvPort: getNextPortFactory('127.0.0.1', 1024, 65535)
  }
};

export const REGISTRATION_MOCK_CONNECTION = {
  authenticated: false,
  log: new Logger('ftp-srv', 'info'),
  reply: () => Promise.resolve({}),
  server: {
    options: {
      blacklist: ['allo']
    }
  }
};

export const USER_MOCK_CONNECTION = {
  reply: () => Promise.resolve(),
  server: {options: {}},
  login: () => Promise.resolve()
};
