module.exports = {
  directive: 'STRU',
  handler: function ({command} = {}) {
    return this.reply(/^F$/i.test(command._[1]) ? 200 : 504);
  },
  syntax: '{{cmd}} [structure]',
  description: 'Set file transfer structure',
  flags: {
    obsolete: true
  }
}
