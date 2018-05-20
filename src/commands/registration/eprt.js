const _ = require('lodash');
const ActiveConnector = require('../../connector/active');

const FAMILY = {
  1: 4,
  2: 6
};

module.exports = {
  directive: 'EPRT',
  handler: function (connection, command) {
    const [, protocol, ip, port] = _.chain(command).get('arg', '').split('|').value();
    const family = FAMILY[protocol];
    if (!family) return connection.reply(504, 'Unknown network protocol');

    connection.connector = new ActiveConnector(connection);
    return connection.connector.setupConnection(ip, port, family)
    .then(() => connection.reply(200));
  },
  syntax: '{{cmd}} |<protocol>|<address>|<port>|',
  description: 'Specifies an address and port to which the server should connect'
};
