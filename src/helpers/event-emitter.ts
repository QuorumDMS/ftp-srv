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

export class EventEmitter {
  private listenerObject;

  constructor() {
    this.listenerObject = {};
  }

  on(eventName, callback) {
    if (!this.listenerObject[eventName]) {
      this.listenerObject[eventName] = [];
    }
    this.listenerObject[eventName].push(callback);
  }

  off(eventName, callback) {
    if (this.listenerObject[eventName]) {
      const index = this.listenerObject[eventName].indexOf(callback);
      if (index !== -1) {
        this.listenerObject[eventName].splice(index, 1);
      }
      //如果移除后监听器数组为空，则删除该事件的键
      if (this.listenerObject[eventName].length === 0) {
        delete this.listenerObject[eventName];
      }
    }
  }

  removeAllListeners(eventName?) {
    if (!!!eventName) {
      //如果不传参数，则移除所有事件的监听器
      this.listenerObject = {};
    } else if (this.listenerObject[eventName]) {
      //如果传了参数，则只移除指定事件的监听器
      delete this.listenerObject[eventName];
    }
  }

  listeners(eventName) {
    //返回指定事件的监听器数组，如果没有则返回空数组
    return this.listenerObject[eventName] || [];
  }

  emit(eventName, ...args) {
    if (this.listenerObject[eventName]) {
      this.listenerObject[eventName].forEach(callback => {
        callback(...args);
      })
    }
  }
}