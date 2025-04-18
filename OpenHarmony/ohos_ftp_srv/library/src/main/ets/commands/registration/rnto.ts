import { promiseTry } from "../../helpers/promise-util";

export const rnto = {
  directive: 'RNTO',
  handler: function (data) {
    if (!this.renameFrom) return this.reply(503);

    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.rename) return this.reply(402, 'Not supported by file system');

    const from = this.renameFrom;
    const to = data.command.arg;

    return promiseTry(() => this.fs.rename(from, to))
      .then(() => {
        return this.reply(250);
      })
      .then(() => this.emit('RNTO', null, to))
      .catch((err) => {
        data.log.error(err);
        this.emit('RNTO', err);
        return this.reply(550, err.message);
      })
      .then(() => {
        delete this.renameFrom;
      });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename to'
};
