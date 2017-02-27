const _ = require('lodash');
const format = require('date-fns/format');
const errors = require('../errors');

module.exports = function (fileStat, format = 'ls') {
  if (typeof format === 'function') return format(fileStat);

  const formats = {
    'ls': ls,
    'ep': ep
  };
  if (!formats.hasOwnProperty(format)) {
    throw new errors.FileSystemError('Bad file stat formatter');
  }
  return formats[format](fileStat);
}

function ls(fileStat) {
  return [
    fileStat.mode !== null
      ? [
        fileStat.isDirectory() ? 'd' : '-',
        400 & fileStat.mode ? 'r' : '-',
        200 & fileStat.mode ? 'w' : '-',
        100 & fileStat.mode ? 'x' : '-',
        40 & fileStat.mode ? 'r' : '-',
        20 & fileStat.mode ? 'w' : '-',
        10 & fileStat.mode ? 'x' : '-',
        4 & fileStat.mode ? 'r' : '-',
        2 & fileStat.mode ? 'w' : '-',
        1 & fileStat.mode ? 'x' : '-'
      ].join('')
      : fileStat.isDirectory() ? 'drwxr-xr-x' : '-rwxr-xr-x',
    '1',
    fileStat.uid,
    fileStat.gid,
    _.padStart(fileStat.size, 12),
    _.padStart(format(fileStat.mtime, 'MMM DD HH:mm'), 12),
    fileStat.name
  ].join(' ');
}

function ep(fileStat) {
  const facts = [
    fileStat.dev && fileStat.ino ? `i${fileStat.dev.toString(16)}.${fileStat.ino.toString(16)}` : null,
    fileStat.size ? `s${fileStat.size}` : null,
    fileStat.mtime ? `m${format(fileStat.mtime, 'X')}` : null,
    fileStat.mode ? `up${fileStat.mode.toString(8).substr(fileStat.mode.toString(8).length - 3)}` : null,
    fileStat.isDirectory() ? 'r' : '/'
  ].join(',');
  return `+${facts}\t${fileStat.name}`;
}
