const PassiveConnector = require('../../connector/passive');

module.exports = {
  directive: 'PASV',
  handler: function () {
    this.connector = new PassiveConnector(this);
    return this.connector.setupServer()
    .then((server) => {
      const address = this.server.options.pasv_url;
      const {port} = server.address();
      const host = address.replace(/\./g, ',');
      const portByte1 = port / 256 | 0;
      const portByte2 = port % 256;

      return this.reply(227, `PASV OK (${host},${portByte1},${portByte2})`);
    });
  },
  syntax: '{{cmd}}',
  description: 'Initiate passive mode'
};
