const net = require('net');

class Client extends net.Socket {
  constructor(id, socket) {
    super();
    socket && Object.assign(this, socket);
    this.id = id;
    this.resetSession();

    super.on('data', data => this._onData(data));
  }

  resetSession() {
    this.session = {
      encoding: 'utf8',
      transferType: 'binary'
    };
  }

  setSession(key, value) {
    this.session[key] = value;
  }

  getSession(key) {
    return this.session[key];
  }

  send(reply) {
    return new Promise((resolve, reject) => {
      super.write(`${reply}\r\n`, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close() {
    if (super.destroyed) return;
    super.destroy();
  }

  _onData(data) {
    const commands = data
      .toString(this.getSession('encoding'))
      .split('\r\n')
      .map(command => command.trim())
      .filter(command => !!command);
  }
}

module.exports = Client;
