const _ = require('lodash');
const when = require('when');

const REGISTRY = require('./registry');

class FtpCommands {
  constructor(connection) {
    this.connection = connection;
    this.previousCommand = {};
    this.blacklist = _.get(this.connection, 'server.options.blacklist', []).map(cmd => _.upperCase(cmd));
    this.whitelist = _.get(this.connection, 'server.options.whitelist', []).map(cmd => _.upperCase(cmd));
  }

  handle(command) {
    // Obfuscate password from logs
    const logCommand = _.clone(command);
    command.directive = _.upperCase(command._[0]);
    if (command.directive === 'PASS') logCommand._[1] = '********';

    const log = this.connection.log.child({directive: command.directive});
    log.trace({command: logCommand}, 'Handle command');

    if (!REGISTRY.hasOwnProperty(command.directive)) {
      return this.connection.reply(402, 'Command not allowed');
    }

    if (_.includes(this.blacklist, command.directive)) {
      return this.connection.reply(502, 'Command blacklisted');
    }

    if (this.whitelist.length > 0 && !_.includes(this.whitelist, command.directive)) {
      return this.connection.reply(502, 'Command not whitelisted');
    }

    const commandRegister = REGISTRY[command.directive];
    const commandFlags = _.get(commandRegister, 'flags', {});
    if (!commandFlags.no_auth && !this.connection.authenticated) {
      return this.connection.reply(530, 'Command requires authentication');
    }

    if (!commandRegister.handler) {
      return this.connection.reply(502, 'Handler not set on command');
    }

    const handler = commandRegister.handler.bind(this.connection);
    return when.try(handler, { log, command, previous_command: this.previousCommand })
    .finally(() => {
      this.previousCommand = _.clone(command);
    });
  }
}
module.exports = FtpCommands;
