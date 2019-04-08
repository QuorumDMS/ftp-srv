module.exports = {
  directive: 'MODE',
  handler: function ({command} = {}) {
    return this.reply(/^S$/i.test(command.arg) ? 200 : 504);
  },
  syntax: '{{cmd}} <mode>',
  description: 'Sets the transfer mode (Stream, Block, or Compressed)',
  flags: {
    obsolete: true
  }
};
