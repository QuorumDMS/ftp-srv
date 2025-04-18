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