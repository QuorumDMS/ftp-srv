import { promiseTry } from "../../helpers/promise-util";

export const size = {
  directive: 'SIZE',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    return promiseTry(() => this.fs.get(data.command.arg))
    .then((fileStat) => {
      return this.reply(213, {message: fileStat.size});
    })
    .catch((err) => {
      data.log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Return the size of a file',
  flags: {
    feat: 'SIZE'
  }
};
