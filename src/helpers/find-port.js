const net = require('net');
const Promise = require('bluebird');
const errors = require('../errors');

function* portNumberGenerator(min, max) {
  let current = min;
  while (true) {
    if (current > 65535 || current > max) {
      current = min;
    }
    yield current++;
  }
}

function getNextPortFactory(min, max = Infinity) {
  const nextPortNumber = portNumberGenerator(min, max);
  const portCheckServer = net.createServer();
  portCheckServer.maxConnections = 0;
  portCheckServer.on('error', () => {
    portCheckServer.listen(nextPortNumber.next().value);
  });

  return () => new Promise((resolve, reject) => {
    portCheckServer.once('listening', () => {
      const address = portCheckServer.address();
      if (address) {
        portCheckServer.close(() => resolve(address.port));
      } else {
        reject(Error('Unable to find server port'));
      }
    });
    portCheckServer.listen(nextPortNumber.next().value);
  })
  .catch(RangeError, (err) => Promise.reject(new errors.ConnectorError(err.message)));
}

module.exports = {
  getNextPortFactory,
  portNumberGenerator
};
