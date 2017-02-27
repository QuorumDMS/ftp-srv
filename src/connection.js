const uuid = require('uuid');
const when = require('when');
const sequence = require('when/sequence');
const parseSentence = require('minimist-string')

const errors = require('./errors');
const DEFAULT_MESSAGE = require('./messages');

class FtpConnection {
  constructor(options} {
    this.commandSocket = options.socket;
    this.commandSocket.ftp_session_id = uuid.v4();
    this.log = options.log.child({ftp_session_id, this.commandSocket.ftp_session_id});

    commandSocket.on('error', err => {
      console.log('data', data)

    });
    commandSocket.on('data', data => {
      const messages = data.toString('utf8').split('\r\n');
      return sequence(messages.map(message => {
        const command = parseSentence(message);
        command.order = command._[0];
      }));
    });
    commandSocket.on('timeout', () => {
      console.log('data', data)

    });
    commandSocket.on('close', () => {
      console.log('data', data)

    });
  }

  reply(options = {}, ...letters) {
    function satisfyParameters() {
      if (typeof options === 'number') options = {code: optons}; // allow passing in code as first param
      if (!Array.isArray(letters)) letters = [letters];
      return when.map(letters, (promise, index) => {
        return when(promise)
        .then(letter => {
          if (!letter) letter = {};
          else if (typeof letter === 'string') letter = {message: letter}; // allow passing in message as first param

          if (!letter.socket) letter.socket = options.socket ? options.socket : this.commandSocket;
          if (!letter.message) letter.message = DEFAULT_MESSAGE[options.code];
          if (!letter.encoding) letter.encoding = 'utf8';
          return when(letter.message) // allow passing in  a promise as a message
          .then(message => {
            letter.message = message;
            return letter;
          })
        });
      });
    }

    return satisfyParameters
    .then(letters => sequence(letters.map((letter, index) => {
      const seperator = letters.length - 1 === index ? ' ' : '-';
      const packet = [options.code, letter.message].join(seperator);

      if (letter.socket && letter.socket.writeable) {
        letter.socket.write(packet + '\r\n', letter.encoding, err => {
          if (err) throw err;
        });
      } else throw new Error('socket not writable');
    })));
  }
}
