
const QUEUE_TYPES = {
  IN: Symbol('in'),
  OUT: Symbol('out')
}

class Queue {
  constructor(handlers = {}) {
    this.items = {};
    this.handlers = {};
    for (const type of Object.values(QUEUE_TYPES)) {
      this.items[type] = [];
      this.handlers[type] = handlers[type];
    }
  }

  enqueue(type, ...items) {
    if (!this.items[type]) return;

    items = items.map(item => {
      if (!Array.isArray(item)) return [item];
      return item;
    });

    this.items[type].push(...items);
  }

  tryDequeue(type) {
    if (!this.items[type]) return;
    if (!this.items[type].length) return;
    if (!this.handlers[type]) return;

    const item = this.items[type].shift();
    const method = this.handlers[type];
    return method(...item);
  }
}

Queue.QUEUE_TYPES = QUEUE_TYPES;
module.exports = Queue;
