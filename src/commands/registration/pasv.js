const PassiveConnector = require('../../connector/passive');
const {isLocalIP} = require('../../helpers/is-local');

module.exports = {
  directive: 'PASV',
  handler: function ({log} = {}) {
    if (!this.server.options.pasv_url) {
      return this.reply(502);
    }

    let port;
    this.connector = new PassiveConnector(this);
    return this.connector.setupServer()
    .then((server) => {
      port = server.address().port;
      // Allow connecting from local
      if (isLocalIP(this.ip)) return this.ip;
      let address = this.server.options.pasv_url;
      if (typeof address === "function") return address(this.ip);
      return address;
    })
    .then((address) => {
      const host = address.replace(/\./g, ',');
      const portByte1 = port / 256 | 0;
      const portByte2 = port % 256;

      return this.reply(227, `PASV OK (${host},${portByte1},${portByte2})`);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(err.code || 425, err.message);
    });
  },
  syntax: '{{cmd}}',
  description: 'Initiate passive mode'
};
