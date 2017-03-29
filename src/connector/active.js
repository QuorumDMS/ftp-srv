const {Socket} = require('net');
const when = require('when');
const Connector = require('./base');

class Active extends Connector {
  constructor(connection) {
    super(connection);
    this.type = 'active';
  }

  waitForConnection({timeout = 5000, delay = 250} = {}) {
    return when.iterate(
      () => {},
      () => this.dataSocket && this.dataSocket.connected,
      () => when().delay(delay)
    ).timeout(timeout)
    .then(() => this.dataSocket);
  }

  setupConnection(host, port) {
    const closeExistingServer = () => this.dataSocket ?
      when(this.dataSocket.destroy()) :
      when.resolve();

    return closeExistingServer()
    .then(() => {
      this.dataSocket = new Socket();
      this.dataSocket.setEncoding(this.encoding);
      this.dataSocket.connect({ host, port }, () => {
        this.dataSocket.pause();
        this.dataSocket.connected = true;
      });
    });
  }
}
module.exports = Active;
