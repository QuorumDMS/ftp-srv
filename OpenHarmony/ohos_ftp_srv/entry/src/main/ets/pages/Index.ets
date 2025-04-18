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

import { FtpSrv } from '@ohos/ftp-srv';

@Entry
@Component
struct Index {
  @State message: string = getContext().resourceManager.getStringByNameSync('Start_server');
  private severIp: string = "localhost";
  private serverPort: number = 8889;

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(42)
          .fontWeight(FontWeight.Bold)
          .onClick((event) => {
            this.startSever();
          })
      }
      .width('100%')
    }
    .height('100%')
  }

  startSever() {
    const ftpSever = new FtpSrv({
      url: "ftp://" + this.severIp + ":" + this.serverPort,
      anonymous: true,
      pasvUrl: this.severIp,
      pasvMin: 8881
    });
    ftpSever.on('login', (user: Option, resolve: Function, reject: Function) => {
      if (user.username === 'demo' && user.password === '123456' || user.username === 'anonymous') {
        resolve({ root: getContext(this).filesDir });
      } else {
        reject('Bad username or password');
      }
    });
    ftpSever.listen().then(() => {
      this.message = getContext().resourceManager.getStringByNameSync('Successfully_started_the_server');
    });
  }
}

interface Option {
  username: string,
  password: string
}