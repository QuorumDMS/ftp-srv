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
      }, ['UTF8'])
      .sort()
      .map((feat) => ({
        message: ` ${feat}`,
        raw: true
      }));
    return features.length
      ? this.reply(211, 'Extensions supported', ...features, 'End')
      : this.reply(211, 'No features');
  },
  syntax: '{{cmd}}',
  description: 'Get the feature list implemented by the server',
  flags: {
    no_auth: true
  }
};
