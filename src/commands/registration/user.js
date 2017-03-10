module.exports = {
  directive: 'USER',
  handler: function ({log, command} = {}) {
    if (this.username) return this.reply(530, 'Username already set');
    this.username = command._[1];
    if (this.server.options.anonymous === true) {
      return this.login(this.username, '@anonymous')
      .then(() => {
        return this.reply(230);
      })
      .catch(err => {
        log.error(err);
        return this.reply(530, err || 'Authentication failed');
      });
    }
    return this.reply(331);
  },
  syntax: '{{cmd}} [username]',
  description: 'Authentication username',
  flags: {
    no_auth: true
  }
}
