const {Socket} = require('net');
const tls = require('tls');
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

  setupConnection(host, port, family = 4) {
    const closeExistingServer = () => this.dataSocket ?
      when(this.dataSocket.destroy()) :
      when.resolve();

    return closeExistingServer()
    .then(() => {
      this.dataSocket = new Socket();
      this.dataSocket.setEncoding(this.connection.transferType);
      this.dataSocket.on('error', err => this.server.emit('client-error', {connection: this.connection, context: 'dataSocket', error: err}));
      this.dataSocket.connect({host, port, family}, () => {
        this.dataSocket.pause();

        if (this.connection.secure) {
          const secureContext = tls.createSecureContext(this.server._tls);
          const secureSocket = new tls.TLSSocket(this.dataSocket, {
            isServer: true,
            secureContext
          });
          this.dataSocket = secureSocket;
        }
        this.dataSocket.connected = true;
      });
    });
  }
}
module.exports = Active;
