const _ = require('lodash');
const buyan = require('bunyan');
const net = require('net');

const Connection = require('./connection');

class FtpServer {
  constructor(options = {}) {
    this.options = _.merge({
      url: 'http://127.0.0.1:21',
      log: buyan.createLogger({name: 'ftp.js'}),
      anonymous: false
    }, options);

    this.server = net.createServer({
      pauseOnConnect: true
    }, socket => {
      let connection = new Connection({this.log, socket});
      const greeting = this.getGreetingMessage();
      const features = this.getFeaturesMessage();
      return connection.reply(220, greeting, features);
    });
    this.server.on('error', err => {
      this.log.error(err);
    });
    this.server.on('')
  }

  getGreetingMessage() {
    return 'greetings';
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

}
module.exports = FtpServer;
