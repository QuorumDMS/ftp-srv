const net = require('net');

const Queue = require('./Queue');
const {getCommandHandler} = require('./commands');

class Client extends net.Socket {
  constructor(id, socket) {
    super();
    socket && Object.assign(this, socket);
    this.id = id;
    this.dataQueue = new Queue(this._processCommand.bind(this));
    this.sendQueue = new Queue(this._processSend.bind(this));
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

  send(message) {
    this.sendQueue.enqueue(message);
  }

  get closed() {
    return this.closing || super.destroyed;
  }

  close() {
    if (super.destroyed) return;
    this.closing = true;
    super.destroy();
  }

  _onData(data) {
    if (this.closed) return;

    const commands = data
      .toString(this.getSession('encoding'))
      .split('\r\n')
      .map(command => command.trim())
      .filter(command => !!command);

    this.dataQueue.enqueue(...commands);
  }

  async _processCommand(command) {

    this.emit('command', {command});

    const commandHandler = getCommandHandler(this, command);
    if (typeof commandHandler === 'string') {
      return this.send(commandHandler);
    }

    await commandHandler(this, command);
  }

  async _processSend(message) {
    await new Promise((resolve, reject) => {
      super.write(`${message}\r\n`, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
} 

module.exports = Client;
