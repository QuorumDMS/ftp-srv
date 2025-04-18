import { Passive } from "../../connector/passive";

export const pasv = {
  directive: 'PASV',
  handler: function (data) {
    if (!this.server.options.pasvUrl) {
      return this.reply(502);
    }
    this.connector = new Passive(this);
    return this.connector.setupServer()
      .then(async (data) => {
        let port = data;
        let pasvAddress = this.server.options.pasvUrl;
        return { address: pasvAddress, port: port };
      })
      .then(({address, port}) => {
        const host = address.replace(/\./g, ',');
        const portByte1 = port / 256 | 0;
        const portByte2 = port % 256;
        return this.reply(227, `PASV OK (${host},${portByte1},${portByte2})`);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}}',
  description: 'Initiate passive mode'
};
