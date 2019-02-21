const http = require('http');
const Promise = require('bluebird');
const errors = require('../errors');

const IP_WEBSITE = 'http://api.ipify.org/';

module.exports = function (hostname) {
  return new Promise((resolve, reject) => {
    if (!hostname || hostname === '0.0.0.0') {
      let ip = '';
      http.get(IP_WEBSITE, (response) => {
        if (response.statusCode !== 200) {
          return reject(new errors.GeneralError('Unable to resolve hostname', response.statusCode));
        }
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          ip += chunk;
        });
        response.on('end', () => {
          resolve(ip);
        });
      });
    } else resolve(hostname);
  });
};
