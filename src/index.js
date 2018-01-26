const _ = require('lodash');
const Promise = require('bluebird');
const nodeUrl = require('url');
const buyan = require('bunyan');
const net = require('net');
const tls = require('tls');
const fs = require('fs');
const EventEmitter = require('events');

const Connection = require('./connection');
const resolveHost = require('./helpers/resolve-host');

class FtpServer extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.options = _.merge({
      log: buyan.createLogger({name: 'ftp-srv'}),
      anonymous: false,
      pasv_range: 22,
      file_format: 'ls',
      blacklist: [],
      whitelist: [],
      greeting: null,
      tls: false
    }, options);
    this._greeting = this.setupGreeting(this.options.greeting);
    this._features = this.setupFeaturesMessage();
    this._tls = this.setupTLS(this.options.tls);

    delete this.options.greeting;
    delete this.options.tls;

    this.connections = {};
    this.log = this.options.log;
    this.url = nodeUrl.parse(url || 'ftp://127.0.0.1:21');

    const serverConnectionHandler = socket => {
      let connection = new Connection(this, {log: this.log, socket});
      this.connections[connection.id] = connection;

      socket.on('close', () => this.disconnectClient(connection.id));

      const greeting = this._greeting || [];
      const features = this._features || 'Ready';
      return connection.reply(220, ...greeting, features)
      .finally(() => socket.resume());
    };
    const serverOptions = _.assign(this.isTLS ? this._tls : {}, {pauseOnConnect: true});

    this.server = (this.isTLS ? tls : net).createServer(serverOptions, serverConnectionHandler);
    this.server.on('error', err => this.log.error(err, '[Event] error'));

    process.on('SIGTERM', () => this.quit());
    process.on('SIGINT', () => this.quit());
    process.on('SIGQUIT', () => this.quit());
  }

  get isTLS() {
    return this.url.protocol === 'ftps:' && this._tls;
  }

  listen() {
    return resolveHost(this.url.hostname)
    .then(hostname => {
      this.url.hostname = hostname;
      return new Promise((resolve, reject) => {
        this.server.listen(this.url.port, err => {
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

  setupTLS(_tls) {
    if (!_tls) return false;
    return _.assign({}, _tls, {
      cert: _tls.cert ? fs.readFileSync(_tls.cert) : undefined,
      key: _tls.key ? fs.readFileSync(_tls.key) : undefined,
      ca: _tls.ca ? Array.isArray(_tls.ca) ? _tls.ca.map(_ca => fs.readFileSync(_ca)) : [fs.readFileSync(_tls.ca)] : undefined
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
    return new Promise(resolve => {
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
    return Promise.map(Object.keys(this.connections), id => Promise.try(this.disconnectClient.bind(this, id)))
    .then(() => new Promise(resolve => {
      this.server.close(err => {
        if (err) this.log.error(err, 'Error closing server');
        resolve('Closed');
      });
    }))
    .then(() => this.removeAllListeners());
  }

}
module.exports = FtpServer;
