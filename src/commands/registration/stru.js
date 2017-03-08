module.exports = {
  directive: 'STRU',
  handler: function ({command} = {}) {
    return this.reply(command._[1] === 'F' ? 200 : 504);
  },
  syntax: '{{cmd}} [structure]',
  description: 'Set file transfer structure',
  flags: {
    obsolete: true
  }
}
