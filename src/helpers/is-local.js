module.exports.isLocalIP = function(ip) {
  return ip === '127.0.0.1' || ip == '::1';
}
