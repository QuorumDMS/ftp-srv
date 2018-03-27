const _ = require('lodash');

module.exports = {
  directive: 'REST',
  handler: function ({command} = {}) {
    const arg = _.get(command, 'arg');
    const byteCount = parseInt(arg, 10);

    if (isNaN(byteCount) || byteCount < 0) return this.reply(501, 'Byte count must be 0 or greater');

    this.restByteCount = byteCount;
    return this.reply(350, `Restarting next transfer at ${byteCount}`);
  },
  syntax: '{{cmd}} <byte-count>',
  description: 'Restart transfer from the specified point. Resets after any STORE or RETRIEVE'
};
