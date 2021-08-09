const Promise = require('bluebird');
const PassiveConnector = require('../../connector/passive');
const {isLocalIP} = require('../../helpers/is-local');

module.exports = {
  directive: 'PASV',
  handler: function ({log} = {}) {
    if (!this.server.options.pasv_url) {
      return this.reply(502);
    }

    this.connector = new PassiveConnector(this);
    return this.connector.setupServer()
    .then((server) => {
      const {port} = server.address();
      let pasvAddress = this.server.options.pasv_url;
      if (typeof pasvAddress === "function") {
        return Promise.try(() => pasvAddress(this.ip))
          .then((address) => ({address, port}));
      }
      // Allow connecting from local
      if (isLocalIP(this.ip)) pasvAddress = this.ip;
      return {address: pasvAddress, port};
    })
    .then(({address, port}) => {
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
