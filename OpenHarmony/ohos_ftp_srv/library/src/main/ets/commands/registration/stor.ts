import { promiseTry } from "../../helpers/promise-util";

export const stor = {
  directive: 'STOR',
  handler: function (data) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.write) return this.reply(402, 'Not supported by file system');

    // const append = data.command.directive === 'APPE';
    const fileName = data.command.arg;
    return this.connector.waitForConnection()
      .then(() => promiseTry(() => this.fs.write(fileName)))
      .then((fsResponse) => {
        let {stream, clientPath} = fsResponse;
        if (!stream && !clientPath) {
          stream = fsResponse;
          clientPath = fileName;
        }
        const serverPath = fileName;
        const socketPromise = new Promise((resolve, reject) => {
          let offsetNumber: number = this.restByteCount;
          let intervalID: number = 0;
          this.connector.socket.on('message', (value) => {
            if (!!!this.connector.socket) {
              return;
            }
            let option = new StreamOption();
            option.offset = offsetNumber;
            option.length = value.message.byteLength;
            try {
              let number = stream.writeSync(value.message, option);
              offsetNumber = offsetNumber + number;
            } catch (err) {
              data.log.error(err);
              this.connector.socket.close((err) => {
                if (err) {
                  data.log.error(err);
                  return;
                }
              })
              reject(err);
            }
            if (!intervalID) {
              intervalID = setInterval(() => {
                if (this.connector.getDataSocketClose()) {
                  clearInterval(intervalID);
                  resolve(null);
                }
              }, 30);
            } else {
              clearInterval(intervalID);
              intervalID = setInterval(() => {
                if (this.connector.getDataSocketClose()) {
                  clearInterval(intervalID);
                  resolve(null);
                }
              }, 30);
              ;
            }
          });
          this.connector.socket.on('error', (err) => {
            reject(err);
          });
        });
        this.restByteCount = 0;
        return this.reply(150)
          .then(() => socketPromise)
          .then(() => this.emit('STOR', null, serverPath))
          .then(() => this.reply(226, clientPath))
          .then(() => stream && stream.closeSync());
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(425, 'No connection established');
      })
      .catch((err) => {
        data.log.error(err);
        this.emit('STOR', err);
        return this.reply(550, err.message);
      })
      .then(() => {
        this.connector.end();

      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Store data as a file at the server site'
};

class StreamOption {
  offset: number = 0;
  length: number = 0;
}