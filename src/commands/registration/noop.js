module.exports = {
  directive: 'NOOP',
  handler: function () {
    return this.reply(200);
  },
  syntax: '{{cmd}}',
  description: 'No operation',
  flags: {
    no_auth: true
  }
};
