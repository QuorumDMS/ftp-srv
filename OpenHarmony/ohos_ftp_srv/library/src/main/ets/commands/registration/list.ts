//@ts-ignore
import { get } from "lodash";
import { promiseTry } from "../../helpers/promise-util";
import { getFileStat } from "../../helpers/file-stat";

// http://cr.yp.to/ftp/list.html
// http://cr.yp.to/ftp/list/eplf.html
export const list = {
  directive: 'LIST',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');
    if (!this.fs.list) return this.reply(402, 'Not supported by file system');

    const simple = data.command.directive === 'NLST';

    const path = data.command.arg || '.';
    return this.connector.waitForConnection()
      .then(() => {
        return promiseTry(() => {
          return this.fs.get(path);
        });
      })
      .then((stat) => {
        if (stat.isDirectory()) {
          return promiseTry(() => {
            return this.fs.list(path);
          });
        } else {
          return [stat];
        }
      })
      .then((files) => {
        const getFileMessage = (file) => {
          if (simple) return file.name;
          return getFileStat(file, get(this, 'server.options.fileFormat', 'ls'));
        };
        return promiseTry(() => files.map((file) => {
          const message = getFileMessage(file);
          return { raw: true,
            message,
            socket: this.connector.socket
          };
        }));
      })
      .then((fileList) => {
        this.reply(150);
        return fileList;
      })
      .then((fileList) => {
        if (fileList.length) return this.reply({}, ...fileList);
        return this.reply({ socket: this.connector.socket, useEmptyMessage: true })
      })
      .then((data) => {
        this.reply(226);
        return data;
      })
      .catch((err) => {
        data.Log.error(err);
        return this.reply(425, 'No connection established');
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(451, err.message || 'No directory');
      })
      .then(() => {
        this.connector.end();
      });
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns information of a file or directory if specified, else information of the current working directory is returned'
};
