const _ = require('lodash');
const when = require('when');
const registry = require('./registry');

module.exports = function ({log, command} = {}) {
  let [, subverb, ...subparameters] = command._;
  subverb = _.upperCase(subverb);
  const subLog = log.child({subverb});

  if (!registry.hasOwnProperty(subverb)) return this.reply(502);

  const subCommand = {
    _: [subverb, ...subparameters],
    directive: subverb
  }
  const handler = registry[subverb].handler.bind(this);
  return when.try(handler, { log: subLog, command: subCommand });
}
