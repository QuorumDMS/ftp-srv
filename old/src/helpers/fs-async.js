const fs = require('fs');
const {promisify} = require('bluebird');

const methods = [
  'stat',
  'readdir',
  'access',
  'unlink',
  'rmdir',
  'mkdir',
  'rename',
  'chmod'
];

module.exports = methods.reduce((obj, method) => {
  obj[method] = promisify(fs[method]);
  return obj;
}, {});
