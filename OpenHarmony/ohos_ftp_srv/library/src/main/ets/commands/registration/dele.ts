import { promiseTry } from "../../helpers/promise-util";

export const dele = {
  directive: 'DELE',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.delete) return this.reply(402, 'Not supported by file system');

    return promiseTry(() => this.fs.delete(data.command.arg))
      .then(() => {
        return this.reply(250);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Delete file'
};
