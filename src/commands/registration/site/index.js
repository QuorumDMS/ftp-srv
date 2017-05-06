const when = require('when');

module.exports = {
  directive: 'SITE',
  handler: function ({log, command} = {}) {
    const registry = require('./registry');
    const subCommand = this.commands.parse(command.arg);
    const subLog = log.child({subverb: subCommand.directive});

    if (!registry.hasOwnProperty(subCommand.directive)) return this.reply(502);

    const handler = registry[subCommand.directive].handler.bind(this);
    return when.try(handler, { log: subLog, command: subCommand });
  },
  syntax: '{{cmd}} [subVerb] [subParams]',
  description: 'Sends site specific commands to remote server'
};
