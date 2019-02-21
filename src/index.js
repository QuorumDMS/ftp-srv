const _ = require('lodash');
const Promise = require('bluebird');
const nodeUrl = require('url');
const buyan = require('bunyan');
const net = require('net');
const tls = require('tls');
const EventEmitter = require('events');

const Connection = require('./connection');
const resolveHost = require('./helpers/resolve-host');
const {getNextPortFactory} = require('./helpers/find-port');

class FtpServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = Object.assign({
      log: buyan.createLogger({name: 'ftp-srv'}),
      url: 'ftp://127.0.0.1:21',
      pasv_min: 1024,
      pasv_max: 65535,
      pasv_url: null,
      anonymous: false,
      file_format: 'ls',
      blacklist: [],
      whitelist: [],
      greeting: null,
      tls: false
    }, options);

    this._greeting = this.setupGreeting(this.options.greeting);
    this._features = this.setupFeaturesMessage();

    delete this.options.greeting;

    this.connections = {};
    this.log = this.options.log;
    this.url = nodeUrl.parse(this.options.url);
    this.getNextPasvPort = getNextPortFactory(
      _.get(this, 'options.pasv_min'),
      _.get(this, 'options.pasv_max'));

    const serverConnectionHandler = (socket) => {
      let connection = new Connection(this, {log: this.log, socket});
      this.connections[connection.id] = connection;

      socket.on('close', () => this.disconnectClient(connection.id));

      const greeting = this._greeting || [];
      const features = this._features || 'Ready';
      return connection.reply(220, ...greeting, features)
      .finally(() => socket.resume());
    };
    const serverOptions = Object.assign({}, this.isTLS ? this.options.tls : {}, {pauseOnConnect: true});

    this.server = (this.isTLS ? tls : net).createServer(serverOptions, serverConnectionHandler);
    this.server.on('error', (err) => this.log.error(err, '[Event] error'));

    const quit = _.debounce(this.quit.bind(this), 100);

    process.on('SIGTERM', quit);
    process.on('SIGINT', quit);
    process.on('SIGQUIT', quit);
  }

  get isTLS() {
    return this.url.protocol === 'ftps:' && this.options.tls;
  }

  listen() {
    return resolveHost(this.options.pasv_url || this.url.hostname)
    .then((pasvUrl) => {
      this.options.pasv_url = pasvUrl;

      return new Promise((resolve, reject) => {
        this.server.once('error', reject);
        this.server.listen(this.url.port, this.url.hostname, (err) => {
          this.server.removeListener('error', reject);
          if (err) return reject(err);
          this.log.info({
            protocol: this.url.protocol.replace(/\W/g, ''),
            ip: this.url.hostname,
            port: this.url.port
          }, 'Listening');
          resolve('Listening');
        });
      });
    });
  }

  emitPromise(action, ...data) {
    return new Promise((resolve, reject) => {
      const params = _.concat(data, [resolve, reject]);
      this.emit.call(this, action, ...params);
    });
  }

  setupGreeting(greet) {
    if (!greet) return [];
    const greeting = Array.isArray(greet) ? greet : greet.split('\n');
    return greeting;
  }

  setupFeaturesMessage() {
    let features = [];
    if (this.options.anonymous) features.push('a');

    if (features.length) {
      features.unshift('Features:');
      features.push('.');
    }
    return features.length ? features.join(' ') : 'Ready';
  }

  disconnectClient(id) {
    return new Promise((resolve) => {
      const client = this.connections[id];
      if (!client) return resolve();
      delete this.connections[id];
      try {
        client.close(0);
      } catch (err) {
        this.log.error(err, 'Error closing connection', {id});
      } finally {
        resolve('Disconnected');
      }
    });
  }

  quit() {
    return this.close()
    .finally(() => process.exit(0));
  }

  close() {
    this.log.info('Server closing...');
    this.server.maxConnections = 0;
    return Promise.map(Object.keys(this.connections), (id) => Promise.try(this.disconnectClient.bind(this, id)))
    .then(() => new Promise((resolve) => {
      this.server.close((err) => {
        if (err) this.log.error(err, 'Error closing server');
        resolve('Closed');
      });
    }))
    .then(() => this.removeAllListeners());
  }

}
module.exports = FtpServer;
