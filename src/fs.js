const _ = require('lodash');
const nodePath = require('path');
const when = require('when');
const whenNode = require('when/node');
const syncFs = require('fs');
const fs = whenNode.liftAll(syncFs);
const errors = require('./errors');

class FileSystem {
  constructor(connection, {
    cwd = '/'
  } = {}) {
    this.connection = connection;
    this.cwd = cwd;
  }

  currentDirectory() {
    return this.cwd;
  }

  get(fileName) {
    const path = nodePath.resolve(this.cwd, fileName);
    return fs.stat(path)
    .then(stat => _.set(stat, 'name', fileName));
  }

  list(path = '.') {
    path = nodePath.resolve(this.cwd, path);
    return fs.readdir(path)
    .then(fileNames => {
      return when.map(fileNames, fileName => {
        const filePath = nodePath.join(path, fileName);
        return fs.access(filePath, syncFs.constants.F_OK)
        .then(() => {
          return fs.stat(filePath)
          .then(stat => _.set(stat, 'name', fileName));
        })
        .catch(() => null);
      });
    })
    .then(_.compact);
  }

  chdir(path = '.') {
    path = nodePath.resolve(this.cwd, path);
    return fs.stat(path)
    .tap(stat => {
      if (!stat.isDirectory()) throw new errors.FileSystemError('Not a valid directory');
    })
    .then(() => {
      this.cwd = path;
      return this.cwd;
    });
  }

  write(fileName, {append = false} = {}) {
    const path = nodePath.resolve(this.cwd, fileName);
    const stream = syncFs.createWriteStream(path, {flags: !append ? 'w+' : 'a+'});
    stream.on('error', () => fs.unlink(path));
    return stream;
  }

  read(fileName) {
    const path = nodePath.resolve(this.cwd, fileName);
    return fs.stat(path)
    .tap(stat => {
      if (stat.isDirectory()) throw new errors.FileSystemError('Cannot read a directory');
    })
    .then(() => {
      const stream = syncFs.createReadStream(path, {flags: 'r'});
      return stream;
    });
  }

  delete(path) {
    const path = nodePath.resolve(this.cwd, path);
    return fs.stat(path)
    .then(stat => {
      if (stat.isDirectory()) return fs.rmdir(path);
      else return fs.unlink(path);
    })
  }

  mkdir(path) {
    path = nodePath.resolve(this.cwd, path);
    return fs.mkdir(path)
    .then(() => path);
  }

  rename(from, to) {
    const fromPath = nodePath.resolve(this.cwd, from);
    const toPath = nodePath.resolve(this.cwd, to);
    return fs.rename(fromPath, toPath);
  }

  chmod(path, mode) {
    path = nodePath.resolve(this.cwd, path);
    return fs.chmod(path, mode);
  }
}
module.exports = FileSystem;
