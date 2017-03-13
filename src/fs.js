const _ = require('lodash');
const nodePath = require('path');
const uuid = require('uuid');
const when = require('when');
const whenNode = require('when/node');
const syncFs = require('fs');
const fs = whenNode.liftAll(syncFs);
const errors = require('./errors');

class FileSystem {
  constructor(connection, {
    root = '/',
    cwd = '/'
  } = {}) {
    this.connection = connection;
    this.cwd = cwd;
    this.root = root;
  }

  _resolvePath(path) {
    const pathParts = {
      root: this.root,
      base: nodePath.resolve(this.cwd, path)
    };
    path = nodePath.format(pathParts);
    return path;
  }

  currentDirectory() {
    return this.cwd;
  }

  get(fileName) {
    const path = this._resolvePath(fileName);
    return fs.stat(path)
    .then(stat => _.set(stat, 'name', fileName));
  }

  list(path = '.') {
    path = this._resolvePath(path);
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
    path = this._resolvePath(path);
    return fs.stat(path)
    .tap(stat => {
      if (!stat.isDirectory()) throw new errors.FileSystemError('Not a valid directory');
    })
    .then(() => {
      this.cwd = path.replace(new RegExp(`^${this.root}`), '') || '/';
      return this.currentDirectory();
    });
  }

  write(fileName, {append = false} = {}) {
    const path = this._resolvePath(fileName);
    const stream = syncFs.createWriteStream(path, {flags: !append ? 'w+' : 'a+'});
    stream.on('error', () => fs.unlink(path));
    return stream;
  }

  read(fileName) {
    const path = this._resolvePath(fileName);
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
    path = this._resolvePath(path);
    return fs.stat(path)
    .then(stat => {
      if (stat.isDirectory()) return fs.rmdir(path);
      else return fs.unlink(path);
    })
  }

  mkdir(path) {
    path = this._resolvePath(path);
    return fs.mkdir(path)
    .then(() => path);
  }

  rename(from, to) {
    const fromPath = this._resolvePath(from);
    const toPath = this._resolvePath(to);
    return fs.rename(fromPath, toPath);
  }

  chmod(path, mode) {
    path = this._resolvePath(path);
    return fs.chmod(path, mode);
  }

  getUniqueName() {
    return uuid.v4().replace(/\W/g, '');
  }
}
module.exports = FileSystem;
