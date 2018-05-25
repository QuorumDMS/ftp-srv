const message = require('../../const/message');

module.exports = {
  directive: 'USER',
  handler: async function (client, command) {
    if (client.getSession('username')) return client.send(message.USERNAME_SET_ALREADY);
    if (client.authenticated) return client.send(message.USER_AUTHENTICATED);
    if (!client.arg) return client.send(message.SYNTAX_ERROR_ARGS);

    this.setSession('username', command.arg);

    // TODO: allow anonymous logins

    await this.reply(message.AWAITING_PASSWORD);
  },
  args: ['<username>'],
  description: 'Set client session username',
  flags: {
    no_auth: true
  }
};