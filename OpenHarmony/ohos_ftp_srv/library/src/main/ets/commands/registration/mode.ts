export const mode = {
    directive: 'MODE',
    handler: function (data) {
        return this.reply(/^S$/i.test(data.command.arg) ? 200 : 504);
    },
    syntax: '{{cmd}} <mode>',
    description: 'Sets the transfer mode (Stream, Block, or Compressed)',
    flags: {
        obsolete: true
    }
};
