//@ts-ignore
import { upperCase, concat, chunk } from "lodash";
import { registry } from "../registry";

export const help = {
  directive: 'HELP',
  handler: function (data) {
    const directive = upperCase(data.command.arg);
    if (directive) {
      if (!registry.hasOwnProperty(directive)) return this.reply(502, `Unknown command ${directive}.`);

      const {syntax, description} = registry[directive];
      const reply = concat([syntax.replace('{{cmd}}', directive), description]);
      return this.reply(214, ...reply);
    } else {
      const supportedCommands = chunk(Object.keys(registry), 5).map((chunk) => chunk.join('\t'));
      return this.reply(211, 'Supported commands:', ...supportedCommands, 'Use "HELP [command]" for syntax help.');
    }
  },
  syntax: '{{cmd}} [<command>]',
  description: 'Returns usage documentation on a command if specified, else a general help document is returned',
  flags: {
    no_auth: true
  }
};
