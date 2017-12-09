const net = require('net');
const Promise = require('bluebird');
const errors = require('../errors');

module.exports = function (min = 1, max = undefined) {
  return new Promise((resolve, reject) => {
    let checkPort = min;
    let portCheckServer = net.createServer();
    portCheckServer.maxConnections = 0;
    portCheckServer.on('error', () => {
      if (checkPort < 65535 && (!max || checkPort < max)) {
        checkPort = checkPort + 1;
        portCheckServer.listen(checkPort);
      } else {
        reject(new errors.GeneralError('Unable to find open port', 500));
      }
    });
    portCheckServer.on('listening', () => {
      const {port} = portCheckServer.address();
      portCheckServer.close(() => {
        portCheckServer = null;
        resolve(port);
      });
    });
    portCheckServer.listen(checkPort);
  });
};
