const _ = require('lodash');

const ENCODING_TYPES = {
  A: 'utf8',
  I: 'binary',
  L: 'binary'
};

module.exports = {
  directive: 'TYPE',
  handler: function ({command} = {}) {
    const encoding = _.upperCase(command.arg);
    if (!ENCODING_TYPES.hasOwnProperty(encoding)) return this.reply(501);

    this.encoding = ENCODING_TYPES[encoding];
    return this.reply(200);
  },
  syntax: '{{cmd}} <mode>',
  description: 'Set the transfer mode, binary (I) or utf8 (A)'
};
