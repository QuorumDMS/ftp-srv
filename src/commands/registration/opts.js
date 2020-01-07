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

    if (!OPTIONS.hasOwnProperty(option)) return this.reply(501, 'Unknown option command');
    return OPTIONS[option].call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Select options for a feature'
};

function utf8([setting] = []) {
  const getEncoding = () => {
    switch (_.toUpper(setting)) {
      case 'ON': return 'utf8';
      case 'OFF': return 'ascii';
      default: return null;
    }
  };

  const encoding = getEncoding();
  if (!encoding) return this.reply(501, 'Unknown setting for option');

  this.encoding = encoding;

  return this.reply(200, `UTF8 encoding ${_.toLower(setting)}`);
}
