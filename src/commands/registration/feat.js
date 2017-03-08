const _ = require('lodash');

module.exports = {
  directive: 'FEAT',
  handler: function () {
    const registry = require('../registry');
    const features = Object.keys(registry)
      .filter(cmd => registry[cmd].hasOwnProperty('feat'))
      .reduce((feats, cmd) => _.concat(feats, registry[cmd].feat), [])
      .map(feat => ` ${feat}`);
    return this.reply(211, 'Extensions supported', ...features, 'END');
  },
  syntax: '{{cmd}}',
  description: 'Get the feature list implemented by the server',
  flags: {
    no_auth: true
  }
}
