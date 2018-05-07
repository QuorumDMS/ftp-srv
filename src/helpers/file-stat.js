const _ = require('lodash');
const moment = require('moment');
const errors = require('../errors');

const FORMATS = {
  ls,
  ep
};

module.exports = function (fileStat, format = 'ls') {
  if (typeof format === 'function') return format(fileStat);
  if (!FORMATS.hasOwnProperty(format)) {
    throw new errors.FileSystemError('Bad file stat formatter');
  }
  return FORMATS[format](fileStat);
};

function ls(fileStat) {
  const now = moment.utc();
  const mtime = moment.utc(new Date(fileStat.mtime));
  const timeDiff = now.diff(mtime, 'months');
  const dateFormat = timeDiff < 6 ? 'MMM DD HH:mm' : 'MMM DD  YYYY';

  return [
    fileStat.mode ? [
      fileStat.isDirectory() ? 'd' : '-',
      fileStat.mode & 256 ? 'r' : '-',
      fileStat.mode & 128 ? 'w' : '-',
      fileStat.mode & 64 ? 'x' : '-',
      fileStat.mode & 32 ? 'r' : '-',
      fileStat.mode & 16 ? 'w' : '-',
      fileStat.mode & 8 ? 'x' : '-',
      fileStat.mode & 4 ? 'r' : '-',
      fileStat.mode & 2 ? 'w' : '-',
      fileStat.mode & 1 ? 'x' : '-'
    ].join('') : fileStat.isDirectory() ? 'drwxr-xr-x' : '-rwxr-xr-x',
    '1',
    fileStat.uid || 1,
    fileStat.gid || 1,
    _.padStart(fileStat.size, 12),
    _.padStart(mtime.format(dateFormat), 12),
    fileStat.name
  ].join(' ');
}

function ep(fileStat) {
  const facts = _.compact([
    fileStat.dev && fileStat.ino ? `i${fileStat.dev.toString(16)}.${fileStat.ino.toString(16)}` : null,
    fileStat.size ? `s${fileStat.size}` : null,
    fileStat.mtime ? `m${moment.utc(new Date(fileStat.mtime)).format('X')}` : null,
    fileStat.mode ? `up${(fileStat.mode & 4095).toString(8)}` : null,
    fileStat.isDirectory() ? '/' : 'r'
  ]).join(',');
  return `+${facts}\t${fileStat.name}`;
}
