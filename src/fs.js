const _ = require('lodash');
const nodePath = require('path');
const uuid = require('uuid');
const when = require('when');
const whenNode = require('when/node');
const syncFs = require('fs');
const fs = whenNode.liftAll(syncFs);
const errors = require('./errors');

class FileSystem {
  constructor(connection, { root, cwd } = {}) {
    this.connection = connection;
    this.cwd = cwd || nodePath.sep;
    this.root = root || process.cwd();
  }

  _resolvePath(path = '') {
    const isFromRoot = _.startsWith(path, '/') || _.startsWith(path, nodePath.sep);
    const cwd = isFromRoot ? nodePath.sep : this.cwd || nodePath.sep;
    const serverPath = nodePath.join(nodePath.sep, cwd, path);
    const fsPath = nodePath.join(this.root, serverPath);

    return {
      serverPath,
      fsPath
    };
  }

  currentDirectory() {
    return this.cwd;
  }

  get(fileName) {
    const {fsPath} = this._resolvePath(fileName);
    return fs.stat(fsPath)
    .then(stat => _.set(stat, 'name', fileName));
  }

  list(path = '.') {
    const {fsPath} = this._resolvePath(path);
    return fs.readdir(fsPath)
    .then(fileNames => {
      return when.map(fileNames, fileName => {
        const filePath = nodePath.join(fsPath, fileName);
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
    const {fsPath, serverPath} = this._resolvePath(path);
    return fs.stat(fsPath)
    .tap(stat => {
      if (!stat.isDirectory()) throw new errors.FileSystemError('Not a valid directory');
    })
    .then(() => {
      this.cwd = serverPath;
      return this.currentDirectory();
    });
  }

  write(fileName, {append = false} = {}) {
    const {fsPath} = this._resolvePath(fileName);
    const stream = syncFs.createWriteStream(fsPath, {flags: !append ? 'w+' : 'a+'});
    stream.on('error', () => fs.unlink(fsPath));
    return stream;
  }

  read(fileName) {
    const {fsPath} = this._resolvePath(fileName);
    return fs.stat(fsPath)
    .tap(stat => {
      if (stat.isDirectory()) throw new errors.FileSystemError('Cannot read a directory');
    })
    .then(() => {
      const stream = syncFs.createReadStream(fsPath, {flags: 'r'});
      return stream;
    });
  }

  delete(path) {
    const {fsPath} = this._resolvePath(path);
    return fs.stat(fsPath)
    .then(stat => {
      if (stat.isDirectory()) return fs.rmdir(fsPath);
      else return fs.unlink(fsPath);
    });
  }

  mkdir(path) {
    const {fsPath} = this._resolvePath(path);
    return fs.mkdir(fsPath)
    .then(() => fsPath);
  }

  rename(from, to) {
    const {fsPath: fromPath} = this._resolvePath(from);
    const {fsPath: toPath} = this._resolvePath(to);
    return fs.rename(fromPath, toPath);
  }

  chmod(path, mode) {
    const {fsPath} = this._resolvePath(path);
    return fs.chmod(fsPath, mode);
  }

  getUniqueName() {
    return uuid.v4().replace(/\W/g, '');
  }
}
module.exports = FileSystem;
