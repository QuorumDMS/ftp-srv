function setAsyncTimeout(method, timeout, ...args) {
  return new Promise(resolve => {
    setTimeout(async () => {
      const result = await method(...args);
      resolve(result)
    }, timeout);
  });
}

module.exports = {
  setAsyncTimeout
};
