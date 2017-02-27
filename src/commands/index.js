const _ = require('lodash');
const when = require('when');

class FtpCommands {
  constructor(connection) {
    this.connection = connection;
    this.registry = require('./registry');
    this.previousCommand = {};
  }

  handle(command) {
    const log = this.connection.log.child({command});
    log.trace('Handle command');

    if (!this.registry.hasOwnProperty(command.directive)) {
      return this.connection.reply(402, 'Command not allowed');
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
