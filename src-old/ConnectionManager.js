class ConnectionManager {
  constructor() {
    this._connections = {};
  }

  add(id, client) {
    this._connections[id] = client;
    return true;
  }

  remove(id) {
    if (!this._connections.hasOwnProperty(id)) return false;
    delete this._connections[id];
    return true;
  }

  invoke(method, ...args) {
    const invokeResults = Object.values(this._connections).map(connection => {
      if (typeof connection[method] !== 'function') return undefined;
      return connection[method](...args);
    });
    return Promise.all(invokeResults);
  }

  iterate() {
    console.log('iterate', iterate)
    const connections = Object.entires(this._connections);
    console.log('connections', connections)
    return connections
  }
}

module.exports = ConnectionManager;
