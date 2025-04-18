import { promiseTry } from "../../helpers/promise-util";

export const mdtm = {
    directive: 'MDTM',
    handler: function (data) {
        if (!this.fs) return this.reply(550, 'File system not instantiated');
        if (!this.fs.get) return this.reply(402, 'Not supported by file system');
        return promiseTry(() => this.fs.get(data.command.arg))
            .then((fileStat) => {
                let fileStatDate = new Date(fileStat.mtime);
                const mtime = new Date(Date.UTC(
                    fileStatDate.getUTCFullYear(),
                    fileStatDate.getUTCMonth(),
                    fileStatDate.getUTCDate(),
                    fileStatDate.getUTCHours(),
                    fileStatDate.getUTCMinutes(),
                    fileStatDate.getUTCSeconds(),
                    fileStatDate.getUTCMilliseconds()));
                const modificationTime = formatDate(mtime);
                return this.reply(213, modificationTime);
            })
            .catch((err) => {
                data.log.error(err);
                return this.reply(550, err.message);
            });
    },
    syntax: '{{cmd}} <path>',
    description: 'Return the last-modified time of a specified file',
    flags: {
        feat: 'MDTM'
    }
};

function formatDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    let milliseconds = date.getMilliseconds(); // 处理毫秒的小数部分，只取三位
    let sss = (milliseconds / 1000).toFixed(3).slice(2);
    return `${year}${month}${day}${hours}${minutes}${seconds}.${sss}`;
}