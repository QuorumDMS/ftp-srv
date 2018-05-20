const _ = require('lodash');

module.exports = {
  directive: 'PROT',
  handler: function (connection, command) {
    if (!connection.secure) return connection.reply(202, 'Not suppored');
    if (!connection.bufferSize && typeof connection.bufferSize !== 'number') return connection.reply(503);

    switch (_.toUpper(command.arg)) {
      case 'P': return connection.reply(200, 'OK');
      case 'C':
      case 'S':
      case 'E': return connection.reply(536, 'Not supported');
      default: return connection.reply(504);
    }
  },
  syntax: '{{cmd}}',
  description: 'Data Channel Protection Level',
  flags: {
    no_auth: true,
    feat: 'PROT'
  }
};
