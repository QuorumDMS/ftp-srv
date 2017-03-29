module.exports = {
  directive: 'OPTS',
  handler: function () {
    return this.reply(501);
  },
  syntax: '{{cmd}}',
  description: 'Select options for a feature'
};
