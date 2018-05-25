const registry = require('./registry');
const message = require('../const/message');

function parseCommand(rawCommand) {
  const strippedRawCommand = rawCommand.replace(/"/g, '');
  const [directive, ...args] = strippedRawCommand.split(' ');
  const params = args.reduce(({arg, flags}, param) => {
    if (/^-{1,2}[a-zA-Z0-9_]+/.test(param)) flags.push(param);
    else arg.push(param);
    return {arg, flags};
  }, {arg: [], flags: []});

  const command = {
    directive: String(directive).trim().toLocaleUpperCase(),
    arg: params.arg.length ? params.arg.join(' ') : null,
    flags: params.flags,
    // raw: rawCommand
  };
  return command;
}

async function getCommandHandler(client, command) {
  command = parseCommand(command);

  if (!registry.hasOwnProperty(command.directive)) return message.UNSUPPORTED_COMMAND;

  const commandRegister = registry[command.directive];
  const commandFlags = commandRegister.flags ? commandRegister.flags : {};
  if (!commandFlags.no_auth && !client.authenticated) {
    return message.COMMAND_REQUIRES_AUTHENTICATION;
  }

  return commandRegister.handle;
}

module.exports = {
  getCommandHandler,
  parseCommand
};
