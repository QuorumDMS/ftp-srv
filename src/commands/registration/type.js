const _ = require('lodash');

module.exports = {
  directive: 'TYPE',
  handler: function ({command} = {}) {
    const encoding = _.upperCase(command._[1]);
    switch (encoding) {
      case 'A':
        this.encoding = 'utf-8';
      case 'I':
      case 'L':
        this.encoding = 'binary';
        return this.reply(200);
      default:
        return this.reply(501);
    }
  },
  syntax: '{{cmd}} [mode]',
  description: 'Set the transfer mode, binary (I) or utf-8 (A)'
}
