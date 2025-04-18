import { promiseTry } from "../../../helpers/promise-util";

export const registry = {
  CHMOD: {
    handler: function (data) {
      if (!this.fs) return this.reply(550, 'File system not instantiated');
      if (!this.fs.chmod) return this.reply(402, 'Not supported by file system');
      const [mode, ...fileNameParts] = data.command.arg.split(' ');
      const fileName = fileNameParts.join(' ');
      return promiseTry(() => this.fs.chmod(fileName, parseInt(mode, 8)))
        .then(() => {
          return this.reply(200);
        })
        .catch((err) => {
          data.log.error(err);
          return this.reply(500);
        });
    }
  }
}