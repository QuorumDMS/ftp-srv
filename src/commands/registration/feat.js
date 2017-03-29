const _ = require('lodash');

module.exports = {
  directive: 'FEAT',
  handler: function () {
    const registry = require('../registry');
    const features = Object.keys(registry)
      .reduce((feats, cmd) => {
        const feat = _.get(registry[cmd], 'flags.feat', null);
        if (feat) return _.concat(feats, feat);
        return feats;
      }, [])
      .map(feat => ` ${feat}`);
    return this.reply(211, 'Extensions supported', ...features, 'END');
  },
  syntax: '{{cmd}}',
  description: 'Get the feature list implemented by the server',
  flags: {
    no_auth: true
  }
};
