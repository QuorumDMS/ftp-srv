const net = require('net');
const when = require('when');
const Connector = require('./base');

class Active extends Connector {
  constructor(connection) {
    super(connection);
    this.type = 'active';
  }

  waitForConnection() {
    return when.iterate(
      () => {},
      () => this.dataSocket && this.dataSocket.connected,
      () => when().delay(250)
    ).timeout(5000)
    .then(() => this.dataSocket);
  }

  setupConnection(host, port) {
    const closeExistingServer = () => this.dataSocket ?
      when(this.dataSocket.destroy()) :
      when.resolve()

    return closeExistingServer()
    .then(() => {
      this.dataSocket = new net.Socket();
      this.dataSocket.setEncoding(this.encoding);
      this.dataSocket.connect({ host, port }, () => {
        this.dataSocket.pause();
        this.dataSocket.connected = true;
      });
    });
  }
}
module.exports = Active;