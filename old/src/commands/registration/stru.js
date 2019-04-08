module.exports = {
  directive: 'STRU',
  handler: function ({command} = {}) {
    return this.reply(/^F$/i.test(command.arg) ? 200 : 504);
  },
  syntax: '{{cmd}} <structure>',
  description: 'Set file transfer structure',
  flags: {
    obsolete: true
  }
};
