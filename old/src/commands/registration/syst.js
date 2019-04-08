module.exports = {
  directive: 'SYST',
  handler: function () {
    return this.reply(215);
  },
  syntax: '{{cmd}}',
  description: 'Return system type',
  flags: {
    no_auth: true
  }
};
