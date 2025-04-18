import { promiseTry } from "../../helpers/promise-util";
import { escapePath } from "../../helpers/escape-path";

export const pwd = {
  directive: ['PWD', 'XPWD'],
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.currentDirectory) return this.reply(402, 'Not supported by file system');

    return promiseTry(() => this.fs.currentDirectory())
      .then((cwd) => {
        const path = cwd ? `"${escapePath(cwd)}"` : undefined;
        return this.reply(257, path);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}}',
  description: 'Print current working directory'
};
