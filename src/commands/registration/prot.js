const _ = require('lodash');

module.exports = {
  directive: 'PROT',
  handler: function ({command} = {}) {
    if (!this.secure) return this.reply(202, 'Not supported');
    if (!this.bufferSize && typeof this.bufferSize !== 'number') return this.reply(503);

    switch (_.toUpper(command.arg)) {
      case 'P': return this.reply(200, 'OK');
      case 'C':
      case 'S':
      case 'E': return this.reply(536, 'Not supported');
      default: return this.reply(504);
    }
  },
  syntax: '{{cmd}}',
  description: 'Data Channel Protection Level',
  flags: {
    no_auth: true,
    feat: 'PROT'
  }
};
