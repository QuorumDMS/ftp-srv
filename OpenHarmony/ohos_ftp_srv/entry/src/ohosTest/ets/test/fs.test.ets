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
import { FileSystem } from '@ohos/ftp-srv';
import { normalizePath, resolvePath } from '@ohos/ftp-srv/src/main/ets/helpers/path-util';

export default function fsTest() {
  describe('fsTestEts', () => {
    let fs: FileSystem;

    beforeAll(() => {
      fs = new FileSystem({}, '/tmp/ftp-srv', 'file/1/2/3');
    })
    it('extend', 0, () => {
      class FileSystemOV extends FileSystem {
        constructor(connection: ESObject) {
          super(connection, "", "");
        }

        get root() {
          return "/extend/FileSystemOV";
        }
      }

      let ovFs = new FileSystemOV({});
      expect(ovFs.root).assertEqual("/extend/FileSystemOV");
    })

    it('gets correct relative path', 0, () => {
      const result = fs._resolvePath('.');
      expect(result.clientPath).assertEqual(normalizePath('/file/1/2/3'));
      expect(result.fsPath).assertEqual(resolvePath('/tmp/ftp-srv/file/1/2/3'));
    })

    it('gets correct relative path two', 0, () => {
      const result = fs._resolvePath('..');
      expect(result.clientPath).assertEqual(
        normalizePath('/file/1/2'));
      expect(result.fsPath).assertEqual(resolvePath('/tmp/ftp-srv/file/1/2'));
    })

    it('gets correct relative path three', 0, () => {
      const result = fs._resolvePath('other');
      expect(result.clientPath).assertEqual(
        normalizePath('/file/1/2/3/other'));
      expect(result.fsPath).assertEqual(resolvePath('/tmp/ftp-srv/file/1/2/3/other'));
    })

    it('gets correct absolute path', 0, () => {
      const result = fs._resolvePath('/other');
      expect(result.clientPath).assertEqual(
        normalizePath('/other'));
      expect(result.fsPath).assertEqual(resolvePath('/tmp/ftp-srv/other'));
    })

    it('cannot escape root - backslash prefix', 0, () => {
      const result = fs._resolvePath('\/../../../../../../');
      expect(result.clientPath).assertEqual(
        normalizePath('/'));
      expect(result.fsPath).assertEqual(resolvePath('/tmp/ftp-srv'));
    })

    it('resolves to file', 0, () => {
      const result = fs._resolvePath('/cool/file.txt');
      expect(result.clientPath).assertEqual(
        normalizePath('/cool/file.txt'));
      expect(result.fsPath).assertEqual(resolvePath('/tmp/ftp-srv/cool/file.txt'));
    })
  })
}