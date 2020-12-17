const _ = require('lodash');
//const registry = require('../registry');

module.exports = {
  directive: 'FEAT',
  handler: function () {
    let registry = require('../registry');
    const features = Object.keys(registry)
    // console.log(features)
    let supported_features = []
    for(let cmd in registry) {
      if(registry[cmd].flags && registry[cmd].flags.feat) {
        supported_features.push(
          {
            message: ` ${registry[cmd].flags.feat}`,
            raw: true
          }
        )
      }
    }
    // console.log(supported_features)
    return supported_features.length
      ? this.reply(211, 'Extensions supported', ...supported_features, 'End')
      : this.reply(211, 'No features');
  },
  syntax: '{{cmd}}',
  description: 'Get the feature list implemented by the server',
  flags: {
    no_auth: true
  }
};
