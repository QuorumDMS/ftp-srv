const _ = require('lodash');
const when = require('when');
const nodeUrl = require('url');
const buyan = require('bunyan');
const net = require('net');

const Connection = require('./connection');
const resolveHost = require('./helpers/resolve-host');

class FtpServer {
  constructor(url, options = {}) {
    this.options = _.merge({
      log: buyan.createLogger({name: 'ftp-svr'}),
      anonymous: false,
      pasv_range: 22,
      file_format: 'ls',
      disabled_commands: []
    }, options);

    this.connections = {};
    this.log = this.options.log;
    this.url = nodeUrl.parse(url || 'ftp://127.0.0.1:21');
    this.server = net.createServer({pauseOnConnect: true}, socket => {
      let connection = new Connection(this, {log: this.log, socket});
      this.connections[connection.id] = connection;

      socket.on('close', () => this.disconnectClient(connection.id));

      const greeting = this.getGreetingMessage();
      const features = this.getFeaturesMessage();
      return connection.reply(220, greeting, features)
      .finally(() => socket.resume());
    });
    this.server.on('error', err => {
      this.log.error(err);
    });
    this.on = this.server.on.bind(this.server);
    this.listeners = this.server.listeners.bind(this.server);
  }

  listen() {
    return resolveHost(this.url.hostname)
    .then(hostname => {
      this.url.hostname = hostname;
      return when.promise((resolve, reject) => {
        this.server.listen(this.url.port, err => {
          if (err) return reject(err);
          this.log.info({port: this.url.port}, 'Listening');
          resolve();
        });
      });
    });
  }

  emit(action, ...data) {
    const defer = when.defer();
    const params = _.concat(data, [defer.resolve, defer.reject]);
    this.server.emit(action, ...params);
    return defer.promise;
  }

  getGreetingMessage() {
    return null;
  }

  getFeaturesMessage() {
    let features = [];
    if (this.options.anonymous) features.push('a');

    if (features.length) {
      features.unshift('Features:');
      features.push('.')
    }
    return features.length ? features.join(' ') : 'Ready';
  }

  setGreeting(gretting) {
    if (typeof greeting === 'string') {
      this.options.greeting = greeting;
    } else {
      gretting.then(greeting => {
        this.options.gretting = greeting;
      })
    }
  }

  disconnectClient(id) {
    return when.promise((resolve, reject) => {
      const client = this.connections[id];
      if (!client) return resolve();
      delete this.connections[id];
      return client.close(0);
    });
  }

  close() {
    this.server.maxConnections = 0;
    return when.map(Object.keys(this.connections), id => this.disconnectClient(id))
    .then(() => when.promise((resolve, reject) => {
      this.server.close(err => {
        if (err) return reject(err);
        resolve();
      });
    }));
  }

}
module.exports = FtpServer;
