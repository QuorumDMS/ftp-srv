const _ = require('lodash');
const ActiveConnector = require('../../connector/active');

const FAMILY = {
  1: 4,
  2: 6
};

module.exports = {
  directive: 'EPRT',
  handler: function ({command} = {}) {
    this.connector = new ActiveConnector(this);
    const [protocol, ip, port] = _.compact(command.arg.split('|'));
    const family = FAMILY[protocol];
    if (!family) return this.reply(502, 'Unknown network protocol');

    return this.connector.setupConnection(ip, port, family)
    .then(() => this.reply(200));
  },
  syntax: '{{cmd}} |<protocol>|<address>|<port>|',
  description: 'Specifies an address and port to which the server should connect'
};
