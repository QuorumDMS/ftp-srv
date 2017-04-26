const _ = require('lodash');
const uuid = require('uuid');
const when = require('when');
const sequence = require('when/sequence');
const parseCommandString = require('minimist-string');

const BaseConnector = require('./connector/base');
const FileSystem = require('./fs');
const Commands = require('./commands');
const errors = require('./errors');
const DEFAULT_MESSAGE = require('./messages');

class FtpConnection {
  constructor(server, options) {
    this.server = server;
    this.commandSocket = options.socket;
    this.id = uuid.v4();
    this.log = options.log.child({id: this.id});
    this.commands = new Commands(this);
    this.encoding = 'utf-8';

    this.connector = new BaseConnector(this);

    this.commandSocket.on('error', err => {
      this.server.server.emit('error', {connection: this, error: err});
    });
    this.commandSocket.on('data', data => {
      const messages = _.compact(data.toString('utf-8').split('\r\n'));
      const handleMessage = message => {
        const command = parseCommandString(message);
        command.directive = _.upperCase(command._[0]);
        return this.commands.handle(command);
      };

      return sequence(messages.map(message => handleMessage.bind(this, message)));
    });
    this.commandSocket.on('timeout', () => {});
    this.commandSocket.on('close', () => {
      if (this.connector) this.connector.end();
      if (this.commandSocket && !this.commandSocket.destroyed) this.commandSocket.destroy();
    });
  }

  close(code = 421, message = 'Closing connection') {
    return when
      .resolve(code)
      .then(code => code && this.reply(code, message))
      .then(() => this.commandSocket && this.commandSocket.end());
  }

  login(username, password) {
    return when.try(() => {
      const loginListeners = this.server.listeners('login');
      if (!loginListeners || !loginListeners.length) {
        if (!this.server.options.anoymous) throw new errors.GeneralError('No "login" listener setup', 500);
      } else {
        return this.server.emit('login', {connection: this, username, password});
      }
    })
    .then(({root = '/', cwd = '/', fs, blacklist = [], whitelist = []} = {}) => {
      this.authenticated = true;
      this.commands.blacklist = _.concat(this.commands.blacklist, blacklist);
      this.commands.whitelist = _.concat(this.commands.whitelist, whitelist);
      this.fs = fs || new FileSystem(this, {root, cwd});
    });
  }

  reply(options = {}, ...letters) {
    const satisfyParameters = () => {
      if (typeof options === 'number') options = {code: options}; // allow passing in code as first param
      if (!Array.isArray(letters)) letters = [letters];
      if (!letters.length) letters = [{}];
      return when.map(letters, promise => {
        return when(promise)
        .then(letter => {
          if (!letter) letter = {};
          else if (typeof letter === 'string') letter = {message: letter}; // allow passing in message as first param

          if (!letter.socket) letter.socket = options.socket ? options.socket : this.commandSocket;
          if (!letter.message) letter.message = DEFAULT_MESSAGE[options.code] || 'No information';
          if (!letter.encoding) letter.encoding = this.encoding;
          return when(letter.message) // allow passing in a promise as a message
          .then(message => {
            letter.message = message;
            return letter;
          });
        });
      });
    };

    const processLetter = (letter, index) => {
      return when.promise((resolve, reject) => {
        const seperator = !options.hasOwnProperty('eol') ?
          letters.length - 1 === index ? ' ' : '-' :
          options.eol ? ' ' : '-';
        const packet = !letter.raw ? _.compact([letter.code || options.code, letter.message]).join(seperator) : letter.message;

        if (letter.socket && letter.socket.writable) {
          this.log.trace({port: letter.socket.address().port, packet}, 'Reply');
          letter.socket.write(packet + '\r\n', letter.encoding, err => {
            if (err) {
              this.log.error(err);
              return reject(err);
            }
            resolve();
          });
        } else reject(new errors.SocketError('Socket not writable'));
      });
    };

    return satisfyParameters()
    .then(satisfiedLetters => sequence(satisfiedLetters.map((letter, index) => processLetter.bind(this, letter, index))))
    .catch(err => {
      this.log.error(err);
    });
  }
}
module.exports = FtpConnection;
