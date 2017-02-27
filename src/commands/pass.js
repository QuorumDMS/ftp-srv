const _ = require('lodash');

module.exports = function ({log, command} = {}) {
  if (!this.username) return this.reply(503);
  if (this.username && this.authenticated &&
    _.get(this, 'server.options.anonymous') === true) return this.reply(230);

  // 332 : require account name (ACCT)

  const password = command._[1];
  return this.login(this.username, password)
  .then(() => {
    return this.reply(230);
  })
  .catch(err => {
    log.error(err);
    return this.reply(530, err.message || 'Authentication failed');
  });
};
