import { Command, CommandDirective } from './types';
import definitions from './definitions';
import { UnsupportedCommandError } from "~/error";
import { CommandConnection } from "~/connection/command";

const CMD_FLAG_REGEX = new RegExp(/^(?:-(\w{1}))|(?:--(\w{2,}))$/);

export function parseCommandString(commandString: string): Command {
  // TODO replace this function with something better

  const strippedMessage = commandString.replace(/"/g, '');
  let [directive, ...args] = strippedMessage.replace(/\r?\n/g, '').split(' ');
  directive = directive.trim().toLocaleUpperCase();

  const parseCommandFlags = !['RETR', 'SIZE', 'STOR'].includes(directive);
  const params = args.reduce(({arg, flags}: {arg: string[], flags: string[]}, param) => {
    if (parseCommandFlags && CMD_FLAG_REGEX.test(param)) flags.push(param);
    else arg.push(param);
    return {arg, flags};
  }, {arg: [], flags: []});

  const command: Command = {
    directive: directive as CommandDirective,
    arg: params.arg.length ? params.arg.join(' ') : undefined,
    flags: params.flags,
    raw: commandString
  };
  return command;
}

export const getCommandContext = (client: CommandConnection, command: Command) => {
  const createDefinition = definitions.get(command.directive);
  if (!createDefinition) {
    throw new UnsupportedCommandError(command.directive);
  }

  const definition = createDefinition(client);
  const context = 'setup' in definition ? definition.setup(command) : undefined;
  return context;
}
