const _ = require('lodash');

module.exports = {
  directive: 'REST',
  handler: function (connection, command) {
    const arg = _.get(command, 'arg');
    const byteCount = parseInt(arg, 10);

    if (isNaN(byteCount) || byteCount < 0) return connection.reply(501, 'Byte count must be 0 or greater');

    connection.restByteCount = byteCount;
    return connection.reply(350, `Restarting next transfer at ${byteCount}`);
  },
  syntax: '{{cmd}} <byte-count>',
  description: 'Restart transfer from the specified point. Resets after any STORE or RETRIEVE'
};
