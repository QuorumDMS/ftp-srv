const _ = require('lodash');

module.exports = function ({command} = {}) {
  const method = _.upperCase(command._[1]);

  switch (method) {
    case 'TLS': return handleTLS.call(this);
    case 'SSL': return handleSSL.call(this);
    default: return this.reply(504);
  }
}

function handleTLS() {
  return this.reply(504);
}

function handleSSL() {
  return this.reply(504);
}
