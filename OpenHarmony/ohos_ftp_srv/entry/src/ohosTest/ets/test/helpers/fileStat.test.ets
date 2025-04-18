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

import { describe, expect, it } from '@ohos/hypium';
import { getFileStat } from '@ohos/ftp-srv/src/main/ets/helpers/file-stat';
import { STAT, STAT_OLD } from '../util';

export default function fileStatTest() {
  describe('fileStatTest', () => {
    it('formats correctly', 0, () => {
      let format: string = getFileStat(STAT, 'ls');
      expect(format).assertEqual('-rwxrwxrwx 1 85 100          527  Oct 11 2017 test1');
    })

    it('formats correctly for files over 6 months old', 0, () => {
      let format: string = getFileStat(STAT_OLD, 'ls');
      expect(format).assertEqual('-rwxrwxrwx 1 84 101          530  Oct 10 2011 test2');
    })

    it('formats without some attributes', 0, () => {
      const format: string = getFileStat({
        name: 'missing stuff',
        mtime: 'Mon, 10 Oct 2011 14:05:12 GMT',
        isDirectory: () => true
      }, 'ls');
      expect(format).assertEqual('drwxr-xr-x 1 1 1               Oct 10 2011 missing stuff');
    })

    it('format - ep formats correctly', 0, () => {
      const format: string = getFileStat(STAT, 'ep');
      expect(format).assertEqual('+i842.2dd69c9,s527,m1507677851,up777,r	test1');
    })

  })
}