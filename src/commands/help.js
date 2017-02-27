const _ = require('lodash');

module.exports = function ({command} = {}) {
  const registry = require('./registry');
  const directive = _.upperCase(command._[1]);
  if (directive) {
    if (!registry.hasOwnProperty(directive)) return this.reply(502, `Unknown command ${directive}.`);

    const {syntax, help, obsolete} = registry[directive];
    const reply = _.concat([syntax, help, obsolete ? 'Obsolete' : null]);
    return this.reply(214, ...reply);
  } else {
    const supportedCommands = _.chunk(Object.keys(registry), 5).map(chunk => chunk.join('\t'));
    return this.reply(211, 'Supported commands:', ...supportedCommands, 'Use "HELP [command]" for syntax help.');
  }
};
