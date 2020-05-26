const _ = require('lodash');

module.exports = {
  directive: 'HELP',
  handler: function ({command} = {}) {
    const registry = require('../registry');
    const directive = _.upperCase(command.arg);
    if (directive) {
      if (!registry.hasOwnProperty(directive)) return this.reply(502, `Unknown command ${directive}.`);

      const {syntax, description} = registry[directive];
      const reply = _.concat([syntax.replace('{{cmd}}', directive), description]);
      return this.reply(214, ...reply);
    } else {
      const supportedCommands = _.chunk(Object.keys(registry), 5).map((chunk) => chunk.join('\t'));
      return this.reply(211, 'Supported commands:', ...supportedCommands, 'Use "HELP [command]" for syntax help.');
    }
  },
  syntax: '{{cmd}} [<command>]',
  description: 'Returns usage documentation on a command if specified, else a general help document is returned',
  flags: {
    no_auth: true
  }
};
