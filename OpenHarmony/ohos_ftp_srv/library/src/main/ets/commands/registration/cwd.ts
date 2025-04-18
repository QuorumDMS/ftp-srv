import { promiseTry } from "../../helpers/promise-util";
import { escapePath } from '../../helpers/escape-path';

export const cwd = {
  directive: ['CWD', 'XCWD'],
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.chdir) return this.reply(402, 'Not supported by file system');

    return promiseTry(() => this.fs.chdir(data.command.arg))
      .then((cwd) => {
        const path = cwd ? `"${escapePath(cwd)}"` : undefined;
        return this.reply(250, path);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Change working directory'
};
