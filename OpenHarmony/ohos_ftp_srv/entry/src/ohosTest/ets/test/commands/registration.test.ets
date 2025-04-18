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
import { FtpCommands } from '@ohos/ftp-srv/src/main/ets/commands/index';
import { REGISTRATION_MOCK_CONNECTION } from '../util';

export default function registrationTest() {
  describe('registrationTest', () => {
    let commands: FtpCommands;

    beforeAll(() => {
      commands = new FtpCommands(REGISTRATION_MOCK_CONNECTION);
    })

    it('no args: test', 0, () => {
      const cmd = commands.parse('test');
      expect(cmd.directive).assertEqual('TEST');
      expect(cmd.arg).assertEqual(null);
      expect(cmd.raw).assertEqual('test');
    });

    it('one arg: test arg', 0, () => {
      const cmd = commands.parse('test arg');
      expect(cmd.directive).assertEqual('TEST');
      expect(cmd.arg).assertEqual('arg');
      expect(cmd.raw).assertEqual('test arg');
    });

    it('two args: test arg1 arg2', 0, () => {
      const cmd = commands.parse('test arg1 arg2');
      expect(cmd.directive).assertEqual('TEST');
      expect(cmd.arg).assertEqual('arg1 arg2');
      expect(cmd.raw).assertEqual('test arg1 arg2');
    });

    it('two args with quotes: test "hello world"', 0, () => {
      const cmd = commands.parse('test "hello world"');
      expect(cmd.directive).assertEqual('TEST');
      expect(cmd.arg).assertEqual('hello world');
      expect(cmd.raw).assertEqual('test "hello world"');
    });

    it('two args, with flags: test -l arg1 -A arg2 --zz88A', 0, () => {
      const cmd = commands.parse('test -l arg1 -A arg2 --zz88A');
      expect(cmd.directive).assertEqual('TEST');
      expect(cmd.arg).assertEqual('arg1 arg2 --zz88A');
      expect(JSON.stringify(cmd.flags)).assertEqual(JSON.stringify(['-l', '-A']));
      expect(cmd.raw).assertEqual('test -l arg1 -A arg2 --zz88A');
    });

    it('one arg, with flags: list -l', 0, () => {
      const cmd = commands.parse('list -l');
      expect(cmd.directive).assertEqual('LIST');
      expect(cmd.arg).assertEqual(null);
      expect(JSON.stringify(cmd.flags)).assertEqual(JSON.stringify(['-l']));
      expect(cmd.raw).assertEqual('list -l');
    });

    it('does not check for option flags', 0, () => {
      const cmd = commands.parse('retr -test');
      expect(cmd.directive).assertEqual('RETR');
      expect(cmd.arg).assertEqual('-test');
      expect(JSON.stringify(cmd.flags)).assertEqual(JSON.stringify([]));
    });
  })
}