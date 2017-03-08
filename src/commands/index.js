const _ = require('lodash');
const when = require('when');

const REGISTRY = require('./registry');

class FtpCommands {
  constructor(connection) {
    console.log(REGISTRY)
    this.connection = connection;
    this.previousCommand = {};
    this.blacklist = _.get(this.connection, 'server.options.blacklist', []).map(cmd => _.upperCase(cmd));
    this.whitelist = _.get(this.connection, 'server.options.whitelist', []).map(cmd => _.upperCase(cmd));
  }

  handle(command) {
    const log = this.connection.log.child({command});
    log.trace('Handle command');

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
      return this.connection.reply(530);
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
