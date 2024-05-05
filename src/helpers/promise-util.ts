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

export async function promiseTry<T>(fn: () => T | Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let result;
    try {
      result = fn();
    } catch (error) {
      return reject(error);
    }
    if (result instanceof Promise) {
      return result.then(resolve, reject);
    }
    resolve(result);
  });
}

export async function promiseMapSeries<T, U>(array: T[], dealData: (item: T) => Promise<U>): Promise<U[]> {
  const results: U[] = [];
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    const result = await dealData(item);
    results.push(result);
  }

  return results;
}

export function promiseWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  //创建一个延迟拒绝的Promise 作为超时机制
  const timeout = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Promise timed out after ${ms} ms.`));
    }, ms);
    //清除定时器，以防Promise 在超时前已解析
    return () => clearTimeout(timer);
  });
  //使用Promise.race 赛跑原始Promise和超时Promise
  const race = Promise.race([promise, timeout]);
  //监听原始Promise 的解析，并在解析时清除超时定时器(如果需要的话)
  promise.then((value) => {
    const cancelTimeout = timeout as any; // 断言以访问 clearTimeout 所数
    if (typeof cancelTimeout === 'function') {
      cancelTimeout(); //清除超时定时器
    }
    return value;
  });
  return race;
}

export async function promiseMap(array, promiseFunction) {
  return Promise.all(array.map(promiseFunction));
}