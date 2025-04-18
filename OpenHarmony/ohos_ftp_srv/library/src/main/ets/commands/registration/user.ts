export const user = {
  directive: 'USER',
  handler: function (data) {
    if (this.username) return this.reply(530, 'Username already set');
    if (this.authenticated) return this.reply(230);

    this.username = data.command.arg;
    if (!this.username) return this.reply(501, 'Must provide username');

    if (this.server.options.anonymous === true && this.username === 'anonymous' ||
      this.username === this.server.options.anonymous) {
      return this.login(this.username, '@anonymous')
        .then(() => {
          return this.reply(230);
        })
        .catch((err) => {
          data.log.error(err);
          return this.reply(530, err.message || 'Authentication failed');
        });
    }
    return this.reply(331);
  },
  syntax: '{{cmd}} <username>',
  description: 'Authentication username',
  flags: {
    no_auth: true
  }
};
