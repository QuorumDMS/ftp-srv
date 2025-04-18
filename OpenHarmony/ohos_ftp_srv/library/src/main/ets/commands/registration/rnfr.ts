import { promiseTry } from "../../helpers/promise-util";

export const rnfr = {
  directive: 'RNFR',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    const fileName = data.command.arg;
    return promiseTry(() => this.fs.get(fileName))
      .then(() => {
        this.renameFrom = fileName;
        return this.reply(350);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename from'
};
