class KeyValueStore {
  constructor(initial = {}) {
    this.reset();
    this.sets(initial);
  }

  reset() {
    this.values = {};
  }

  get(key) {
    if (!this.values || !this.values[key]) return undefined;
    return this.values[key];
  }

  set(key, value) {
    if (!this.values) this.reset();
    this.values[key] = value;
  }

  sets(values) {
    for (const [key, value] of Object.entries(values)) {
      this.set(key, value)
    }
  }
}
module.exports = KeyValueStore;
