export const pass = {
  directive: 'PASS',
  handler: function (data) {
    if (!this.username) return this.reply(503);
    if (this.authenticated) return this.reply(202);

    // 332 : require account name (ACCT)

    const password = data.command.arg;
    if (!password) return this.reply(501, 'Must provide password');
    return this.login(this.username, password)
      .then(() => {
        return this.reply(230);
      })
      .catch((err) => {
        data.log.error(err.message);
        return this.reply(530, err.message || 'Authentication failed');
      });
  },
  syntax: '{{cmd}} <password>',
  description: 'Authentication password',
  flags: {
    no_auth: true
  }
};
