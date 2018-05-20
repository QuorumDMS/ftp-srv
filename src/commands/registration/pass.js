module.exports = {
  directive: 'PASS',
  handler: function (connection, command) {
    if (!connection.username) return this.reply(503);
    if (this.authenticated) return this.reply(202);

    // 332 : require account name (ACCT)

    const password = command.arg;
    if (!password) return this.reply(501, 'Must provide password');
    return connection.login(connection.username, password)
    .then(() => {
      return connection.reply(230);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(530, err.message || 'Authentication failed');
    });
  },
  syntax: '{{cmd}} <password>',
  description: 'Authentication password',
  flags: {
    no_auth: true
  }
};
