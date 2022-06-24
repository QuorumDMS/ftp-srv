const _ = require('lodash');
const Promise = require('bluebird');

const REGISTRY = require('./registry');

const CMD_FLAG_REGEX = new RegExp(/^-(\w{1})$/);

class FtpCommands {
  constructor(connection) {
    this.connection = connection;
    this.previousCommand = {};
    this.blacklist = _.get(this.connection, 'server.options.blacklist', []).map((cmd) => _.upperCase(cmd));
    this.whitelist = _.get(this.connection, 'server.options.whitelist', []).map((cmd) => _.upperCase(cmd));
  }

  parse(message) {
    const strippedMessage = message.replace(/"/g, '');
    let [directive, ...args] = strippedMessage.split(' ');
    directive = _.chain(directive).trim().toUpper().value();

    const parseCommandFlags = !['RETR', 'SIZE', 'STOR'].includes(directive);
    const params = args.reduce(({arg, flags}, param) => {
      if (parseCommandFlags && CMD_FLAG_REGEX.test(param)) flags.push(param);
      else arg.push(param);
      return {arg, flags};
    }, {arg: [], flags: []});

    const command = {
      directive,
      arg: params.arg.length ? params.arg.join(' ') : null,
      flags: params.flags,
      raw: message
    };
    return command;
  }

  handle(command) {
    if (typeof command === 'string') command = this.parse(command);

    // Obfuscate password from logs
    const logCommand = _.clone(command);
    if (logCommand.directive === 'PASS') logCommand.arg = '********';

    const log = this.connection.log.child({directive: command.directive});
    log.trace({command: logCommand}, 'Handle command');

    if (!REGISTRY.hasOwnProperty(command.directive)) {
      return this.connection.reply(502, `Command not allowed: ${command.directive}`);
    }

    if (_.includes(this.blacklist, command.directive)) {
      return this.connection.reply(502, `Command blacklisted: ${command.directive}`);
    }

    if (this.whitelist.length > 0 && !_.includes(this.whitelist, command.directive)) {
      return this.connection.reply(502, `Command not whitelisted: ${command.directive}`);
    }

    const commandRegister = REGISTRY[command.directive];
    const commandFlags = _.get(commandRegister, 'flags', {});
    if (!commandFlags.no_auth && !this.connection.authenticated) {
      return this.connection.reply(530, `Command requires authentication: ${command.directive}`);
    }

    if (!commandRegister.handler) {
      return this.connection.reply(502, `Handler not set on command: ${command.directive}`);
    }

    const handler = commandRegister.handler.bind(this.connection);
    return Promise.resolve(handler({log, command, previous_command: this.previousCommand}))
    .then(() => {
      this.previousCommand = _.clone(command);
    });
  }
}
module.exports = FtpCommands;
