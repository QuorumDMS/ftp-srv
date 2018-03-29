const message = require('../../const/message');

module.exports = {
  directive: 'PASS',
  handler: async function (client, command) {
    if (!client.getSession('username')) return client.send(message.BAD_COMMAND_SEQUENCE);
    if (client.authenticated) return client.send(message.SUPERFLUOUS_COMMAND);
    if (!command.arg) return client.send(message.SYNTAX_ERROR_ARGS);
    // TODO: 332 : require account name (ACCT)

    // TODO: do login

    await client.send(message.AUTHENTICATED);
  },
  args: ['<password>'],
  description: 'Authenticate client session',
  flags: {
    no_auth: true
  }
};