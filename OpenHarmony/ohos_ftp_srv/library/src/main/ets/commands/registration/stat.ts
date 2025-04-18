//@ts-ignore
import { get } from "lodash";
import { promiseTry, promiseMap } from "../../helpers/promise-util";
import { getFileStat } from "../../helpers/file-stat";

export const stat = {
  directive: 'STAT',
  handler: function (args = {}) {
    let path;
    if ('command' in args) {
      path = get(args.command, 'arg');
    }
    if (path) {
      if (!this.fs) return this.reply(550, 'File system not instantiated');
      if (!this.fs.get) return this.reply(402, 'Not supported by file system');

      return promiseTry(() => this.fs.get(path))
        .then((stat) => {
          if (stat.isDirectory()) {
            if (!this.fs.list) return this.reply(402, 'Not supported by file system');

            return promiseTry(() => this.fs.list(path))
              .then((stats) => [213, stats]);
          }
          return [212, [stat]];
        })
        .then(([code, fileStats]) => {
          return promiseMap(fileStats, (file) => {
            const message = getFileStat(file,get(this, 'server.options.fileFormat', 'ls'));
            return {
              raw: true,
              message
            };
          })
            .then((messages) => [code, messages]);
        })
        .then(([code, messages]) => this.reply(code, 'Status begin', ...messages, 'Status end'))
        .catch((err) => {
          return this.reply(450, err.message);
        });
    } else {
      return this.reply(211, 'Status OK');
    }
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns the current status'
};
