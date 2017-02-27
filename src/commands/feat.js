const _ = require('lodash');

module.exports = function () {
  const registry = require('./registry');
  const features = Object.keys(registry)
    .filter(cmd => registry[cmd].hasOwnProperty('feat'))
    .reduce((feats, cmd) => _.concat(feats, registry[cmd].feat), [])
    .map(feat => ` ${feat}`);
  return this.reply(211, 'Extensions supported', ...features, 'END');
}
