import { promiseTry } from "../../helpers/promise-util";
import { escapePath } from '../../helpers/escape-path';

export const mkd = {
    directive: ['MKD', 'XMKD'],
    handler: function (data) {
        if (!this.fs) return this.reply(550, 'File system not instantiated');
        if (!this.fs.mkdir) return this.reply(402, 'Not supported by file system');

        return promiseTry(() => this.fs.mkdir(data.command.arg))
            .then((dir) => {
                const path = dir ? `"${escapePath(dir)}"` : undefined;
                return this.reply(257, path);
            })
            .catch((err) => {
                data.log.error(err);
                return this.reply(550, err.message);
            });
    },
    syntax: '{{cmd}} <path>',
    description: 'Make directory'
};
