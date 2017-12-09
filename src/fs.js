const _ = require('lodash');
const nodePath = require('path');
const uuid = require('uuid');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const errors = require('./errors');

class FileSystem {
  constructor(connection, {root, cwd} = {}) {
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
    return fs.statAsync(fsPath)
    .then(stat => _.set(stat, 'name', fileName));
  }

  list(path = '.') {
    const {fsPath} = this._resolvePath(path);
    return fs.readdirAsync(fsPath)
    .then(fileNames => {
      return Promise.map(fileNames, fileName => {
        const filePath = nodePath.join(fsPath, fileName);
        return fs.accessAsync(filePath, fs.constants.F_OK)
        .then(() => {
          return fs.statAsync(filePath)
          .then(stat => _.set(stat, 'name', fileName));
        })
        .catch(() => null);
      });
    })
    .then(_.compact);
  }

  chdir(path = '.') {
    const {fsPath, serverPath} = this._resolvePath(path);
    return fs.statAsync(fsPath)
    .tap(stat => {
      if (!stat.isDirectory()) throw new errors.FileSystemError('Not a valid directory');
    })
    .then(() => {
      this.cwd = serverPath;
      return this.currentDirectory();
    });
  }

  write(fileName, {append = false, start = undefined} = {}) {
    const {fsPath} = this._resolvePath(fileName);
    const stream = fs.createWriteStream(fsPath, {flags: !append ? 'w+' : 'a+', start});
    stream.once('error', () => fs.unlinkAsync(fsPath));
    stream.once('close', () => stream.end());
    return stream;
  }

  read(fileName, {start = undefined} = {}) {
    const {fsPath} = this._resolvePath(fileName);
    return fs.statAsync(fsPath)
    .tap(stat => {
      if (stat.isDirectory()) throw new errors.FileSystemError('Cannot read a directory');
    })
    .then(() => {
      const stream = fs.createReadStream(fsPath, {flags: 'r', start});
      return stream;
    });
  }

  delete(path) {
    const {fsPath} = this._resolvePath(path);
    return fs.statAsync(fsPath)
    .then(stat => {
      if (stat.isDirectory()) return fs.rmdirAsync(fsPath);
      else return fs.unlinkAsync(fsPath);
    });
  }

  mkdir(path) {
    const {fsPath} = this._resolvePath(path);
    return fs.mkdirAsync(fsPath)
    .then(() => fsPath);
  }

  rename(from, to) {
    const {fsPath: fromPath} = this._resolvePath(from);
    const {fsPath: toPath} = this._resolvePath(to);
    return fs.renameAsync(fromPath, toPath);
  }

  chmod(path, mode) {
    const {fsPath} = this._resolvePath(path);
    return fs.chmodAsync(fsPath, mode);
  }

  getUniqueName() {
    return uuid.v4().replace(/\W/g, '');
  }
}
module.exports = FileSystem;
