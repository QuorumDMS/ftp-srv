const Promise = require('bluebird');
const _ = require('lodash');

const registry = require('./registry');

module.exports = {
  directive: 'SITE',
  handler: function ({log, command} = {}) {
    const rawSubCommand = _.get(command, 'arg', '');
    const subCommand = this.commands.parse(rawSubCommand);
    const subLog = log.child({subverb: subCommand.directive});

    if (!registry.hasOwnProperty(subCommand.directive)) return this.reply(502);

    const handler = registry[subCommand.directive].handler.bind(this);
    return Promise.resolve(handler({log: subLog, command: subCommand}));
  },
  syntax: '{{cmd}} <subVerb> [...<subParams>]',
  description: 'Sends site specific commands to remote server'
};
