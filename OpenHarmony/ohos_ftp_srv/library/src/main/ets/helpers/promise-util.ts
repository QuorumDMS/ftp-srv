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