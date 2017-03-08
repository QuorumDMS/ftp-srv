module.exports = {
  directive: 'MODE',
  handler: function ({command} = {}) {
    return this.reply(command._[1] === 'S' ? 200 : 504);
  },
  syntax: '{{cmd}} [mode]',
  description: 'Sets the transfer mode (Stream, Block, or Compressed)',
  flags: {
    obsolete: true
  }
}
