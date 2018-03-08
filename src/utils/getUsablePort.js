const net = require('net');

const PORT_MAX = 65535;

function getUsablePort(portStart = 21, portStop = Infinity) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.maxConnections = 0;
  
    const cleanUpServer = () => {
      server.removeAllListeners();
      server.unref();
    };

    let currentPort = portStart;
    server.on('error', err => {
      if (currentPort < PORT_MAX && currentPort < portStop) {
        server.listen(++currentPort);
      } else {
        server.close(() => {
          cleanUpServer();
          reject(err);
        });
      }
    });
    server.on('listening', () => {
      const {port} = server.address();
      server.close(() => {
        cleanUpServer();
        resolve(port); 
      })
    });
    server.listen(currentPort);
  });
}

module.exports = {
  getUsablePort
};
