//@ts-ignore
import { get } from "lodash";
import { registry } from "./registry";

export const site = {
  directive: 'SITE',
  handler: function (data) {
    const rawSubCommand = get(data.command, 'arg', '');
    const subCommand = this.commands.parse(rawSubCommand);
    const subLog = data.log;
    subLog.info({ subverb: subCommand.directive });

    if (!registry.hasOwnProperty(subCommand.directive)) return this.reply(502);

    const handler = registry[subCommand.directive].handler.bind(this);
    return Promise.resolve(handler({ log: subLog, command: subCommand }));
  },
  syntax: '{{cmd}} <subVerb> [...<subParams>]',
  description: 'Sends site specific commands to remote server'
};


