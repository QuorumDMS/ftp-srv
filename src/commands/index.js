const _ = require('lodash');
const when = require('when');

class FtpCommands {
  constructor(connection) {
    this.connection = connection;
    this.registry = require('./registry');
    this.previousCommand = {};
    this.disabledCommands = _.get(this.connection, 'server.options.disabled_commands', []).map(cmd => _.upperCase(cmd));
    console.log(this.disabledCommands)
  }

  handle(command) {
    const log = this.connection.log.child({command});
    log.trace('Handle command');

    if (!this.registry.hasOwnProperty(command.directive)) {
      return this.connection.reply(402, 'Command not allowed');
    }

    if (_.includes(this.disabledCommands, command.directive)) {
      return this.connection.reply(502, 'Command forbidden');
    }

    const commandRegister = this.registry[command.directive];
    if (!commandRegister.no_auth && !this.connection.authenticated) {
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
