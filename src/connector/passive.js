const net = require('net');
const when = require('when');
const Connector = require('./base');
const findPort = require('../helpers/find-port');
const errors = require('../errors');

class Passive extends Connector {
  constructor(connection) {
    super(connection);
    this.type = 'passive';
  }

  waitForConnection({timeout = 5000, delay = 250} = {}) {
    if (!this.dataServer) {
      return when.reject(new errors.ConnectorError('Passive server not setup'));
    }
    return when.iterate(
      () => {},
      () => this.dataServer && this.dataServer.listening && this.dataSocket && this.dataSocket.connected,
      () => when().delay(delay)
    ).timeout(timeout)
    .then(() => this.dataSocket);
  }

  setupServer() {
    const closeExistingServer = () => this.dataServer ?
      when.promise(resolve => this.dataServer.close(() => resolve())) :
      when.resolve()

    return closeExistingServer()
    .then(() => this.getPort())
    .then(port => {
      this.dataSocket = null;
      this.dataServer = net.createServer({pauseOnConnect: true});
      this.dataServer.maxConnections = 1;
      this.dataServer.on('connection', socket => {
        if (this.connection.commandSocket.remoteAddress !== socket.remoteAddress) {
          this.log.error({
            pasv_connection: socket.remoteAddress,
            cmd_connection: this.connection.commandSocket.remoteAddress
          }, 'Connecting addresses do not match');

          socket.destroy();
          return this.connection.reply(550, 'Remote addresses do not match')
          .finally(() => this.connection.close());
        }
        this.log.debug({port}, 'Passive connection fulfilled.');

        this.dataSocket = socket;
        this.dataSocket.connected = true;
        this.dataSocket.setEncoding(this.connection.encoding);
        this.dataSocket.on('close', () => {
          this.log.debug('Passive connection closed');
          this.end();
        });
      });
      this.dataServer.on('close', () => {
        this.log.debug('Passive server closed');
        this.dataServer = null;
      });

      return when.promise((resolve, reject) => {
        this.dataServer.listen(port, err => {
          if (err) reject(err);
          else {
            this.log.info({port}, 'Passive connection listening');
            resolve(this.dataServer);
          }
        });
      });
    });
  }

  getPort() {
    if (this.server.options.pasv_range) {
      const [min, max] = typeof this.server.options.pasv_range === 'string' ?
        this.server.options.pasv_range.split('-').map(v => v ? parseInt(v) : v) :
        [this.server.options.pasv_range];
      return findPort(min, max);
    } else return undefined;
  };

}
module.exports = Passive;
