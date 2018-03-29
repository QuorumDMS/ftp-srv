
class Queue {
  constructor(handleMethod) {
    this.items = [];
    this.running = false;
    this.handleMethod = handleMethod;
  }

  enqueue(...items) {
    this.items.push(...items);
    if (!this.running) {
      this.tryDequeue();
    }
  }

  async tryDequeue() {
    if (this.items.length === 0) {
      this.running = false;
      return;
    }
    
    this.running = true;
    const item = this.items.shift();
    await this.handleMethod(item);
    this.tryDequeue();
  }
}
module.exports = Queue;
