const _ = require('lodash');

const OPTIONS = {
  UTF8: utf8,
  'UTF-8': utf8
};

module.exports = {
  directive: 'OPTS',
  handler: function ({command} = {}) {
    if (!_.has(command, 'arg')) return this.reply(501);

    const [_option, ...args] = command.arg.split(' ');
    const option = _.toUpper(_option);

    if (!OPTIONS.hasOwnProperty(option)) return this.reply(500);
    return OPTIONS[option].call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Select options for a feature'
};

function utf8([setting] = []) {
  switch (_.toUpper(setting)) {
    case 'ON':
      this.encoding = 'utf8';
      return this.reply(200, 'UTF8 encoding on');
    case 'OFF':
      this.encoding = 'ascii';
      return this.reply(200, 'UTF8 encoding off');
    default:
      return this.reply(501, 'Unknown setting for option');
  }
}
