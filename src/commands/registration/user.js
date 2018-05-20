module.exports = {
  directive: 'USER',
  handler: function (connection, command) {
    if (connection.username) return connection.reply(530, 'Username already set');
    if (connection.authenticated) return connection.reply(230);

    connection.username = command.arg;
    if (!connection.username) return connection.reply(501, 'Must provide username');

    if (connection.server.options.anonymous === true && connection.username === 'anonymous' ||
        connection.username === connection.server.options.anonymous) {
      return connection.login(connection.username, '@anonymous')
      .then(() => {
        return connection.reply(230);
      })
      .catch(err => {
        connection.emit('error', err);
        return connection.reply(530, err.message || 'Authentication failed');
      });
    }
    return connection.reply(331);
  },
  syntax: '{{cmd}} <username>',
  description: 'Authentication username',
  flags: {
    no_auth: true
  }
};
