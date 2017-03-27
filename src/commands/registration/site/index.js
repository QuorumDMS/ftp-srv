const _ = require('lodash');
const when = require('when');

module.exports = {
  directive: 'SITE',
  handler: function ({log, command} = {}) {
    const registry = require('./registry');
    let [, subverb, ...subparameters] = command._;
    subverb = _.upperCase(subverb);
    const subLog = log.child({subverb});

    if (!registry.hasOwnProperty(subverb)) return this.reply(502);

    const subCommand = {
      _: [subverb, ...subparameters],
      directive: subverb
    };
    const handler = registry[subverb].handler.bind(this);
    return when.try(handler, { log: subLog, command: subCommand });
  },
  syntax: '{{cmd}} [subVerb] [subParams]',
  description: 'Sends site specific commands to remote server'
};
