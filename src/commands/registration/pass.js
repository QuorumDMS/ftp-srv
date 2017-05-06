const _ = require('lodash');

module.exports = {
  directive: 'PASS',
  handler: function ({log, command} = {}) {
    if (!this.username) return this.reply(503);
    if (this.username && this.authenticated &&
      _.get(this, 'server.options.anonymous') === true) return this.reply(230);

    // 332 : require account name (ACCT)

    const password = command.arg;
    return this.login(this.username, password)
    .then(() => {
      return this.reply(230);
    })
    .catch(err => {
      log.error(err);
      return this.reply(530, err.message || 'Authentication failed');
    });
  },
  syntax: '{{cmd}} [password]',
  description: 'Authentication password',
  flags: {
    no_auth: true
  }
};
