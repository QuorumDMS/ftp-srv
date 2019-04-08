const _ = require('lodash');
const nodePath = require('path');
const uuid = require('uuid');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const errors = require('./errors');

class FileSystem {
  constructor(connection, {root, cwd} = {}) {
    this.connection = connection;
    this.cwd = cwd ? nodePath.join(nodePath.sep, cwd) : nodePath.sep;
    this._root = nodePath.resolve(root || process.cwd());
  }

  get root() {
    return this._root;
  }

  _resolvePath(path = '.') {
    const clientPath = (() => {
      path = nodePath.normalize(path);
      if (nodePath.isAbsolute(path)) {
        return nodePath.join(path);
      } else {
        return nodePath.join(this.cwd, path);
      }
    })();

    const fsPath = (() => {
      const resolvedPath = nodePath.resolve(this.root, `.${nodePath.sep}${clientPath}`);
      return nodePath.join(resolvedPath);
    })();

    return {
      clientPath,
      fsPath
    };
  }

  currentDirectory() {
    return this.cwd;
  }

  get(fileName) {
    const {fsPath} = this._resolvePath(fileName);
    return fs.statAsync(fsPath)
    .then((stat) => _.set(stat, 'name', fileName));
  }

  list(path = '.') {
    const {fsPath} = this._resolvePath(path);
    return fs.readdirAsync(fsPath)
    .then((fileNames) => {
      return Promise.map(fileNames, (fileName) => {
        const filePath = nodePath.join(fsPath, fileName);
        return fs.accessAsync(filePath, fs.constants.F_OK)
        .then(() => {
          return fs.statAsync(filePath)
          .then((stat) => _.set(stat, 'name', fileName));
        })
        .catch(() => null);
      });
    })
    .then(_.compact);
  }

  chdir(path = '.') {
    const {fsPath, clientPath} = this._resolvePath(path);
    return fs.statAsync(fsPath)
    .tap((stat) => {
      if (!stat.isDirectory()) throw new errors.FileSystemError('Not a valid directory');
    })
    .then(() => {
      this.cwd = clientPath;
      return this.currentDirectory();
    });
  }

  write(fileName, {append = false, start = undefined} = {}) {
    const {fsPath, clientPath} = this._resolvePath(fileName);
    const stream = fs.createWriteStream(fsPath, {flags: !append ? 'w+' : 'a+', start});
    stream.once('error', () => fs.unlinkAsync(fsPath));
    stream.once('close', () => stream.end());
    return {
      stream,
      clientPath
    };
  }

  read(fileName, {start = undefined} = {}) {
    const {fsPath, clientPath} = this._resolvePath(fileName);
    return fs.statAsync(fsPath)
    .tap((stat) => {
      if (stat.isDirectory()) throw new errors.FileSystemError('Cannot read a directory');
    })
    .then(() => {
      const stream = fs.createReadStream(fsPath, {flags: 'r', start});
      return {
        stream,
        clientPath
      };
    });
  }

  delete(path) {
    const {fsPath} = this._resolvePath(path);
    return fs.statAsync(fsPath)
    .then((stat) => {
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
