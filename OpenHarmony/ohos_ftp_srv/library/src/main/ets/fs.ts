//@ts-ignore
import { set, compact } from "lodash";
import util from '@ohos.util';
import fs from '@ohos.file.fs';
import { promiseMap } from "./helpers/promise-util";
import { FileSystemError } from "./errors";
import { normalizePath, resolvePath, isAbsolutePath, joinPath } from "./helpers/path-util";


const UNIX_SEP_REGEX = /\//g;
const WIN_SEP_REGEX = /\\/g;


export class FileSystem {
  connection;
  cwd;
  _root;

  constructor(connection, root, cwd) {
    this.connection = connection;
    this.cwd = normalizePath((cwd || '/').replace(WIN_SEP_REGEX, '/'));
    this._root = resolvePath(root || cwd);
  }

  get root() {
    return this._root;
  }

  _resolvePath(path = '.') {
    // Unix separators normalize nicer on both unix and win platforms
    const resolvedPath = path.replace(WIN_SEP_REGEX, '/');

    // Join cwd with new path
    const joinedPath = isAbsolutePath(resolvedPath)
      ? normalizePath(resolvedPath)
      : joinPath('/', this.cwd, resolvedPath);

    // Create local filesystem path using the platform separator
    const fsPath = resolvePath(joinPath(this.root, joinedPath)
      .replace(UNIX_SEP_REGEX, '/')
      .replace(WIN_SEP_REGEX, '/'));

    // Create FTP client path using unix separator
    const clientPath = joinedPath.replace(WIN_SEP_REGEX, '/');

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
    return fs.stat(fsPath).then((stat: fs.Stat) => set(stat, 'name', fileName));
  }

  list(path = '.') {
    const {fsPath} = this._resolvePath(path);
    return fs.listFile(fsPath)
      .then((fileNames) => {
        return promiseMap(fileNames, (fileName: string) => {
          const filePath = joinPath(fsPath, fileName);
          return fs.access(filePath).then((res: boolean) => {
            if (res) {
              return fs.stat(filePath)
                .then((stat: fs.Stat) => set(stat, 'name', fileName))
            } else {
              return null;
            }
          })
            .catch(() => null)
        });
      })
      .then(compact)
  }

  chdir(path = '.') {
    const {fsPath, clientPath} = this._resolvePath(path);
    if(!!!fs.accessSync(fsPath)) {
      fs.mkdirSync(fsPath, true);
    }
    return fs.stat(fsPath).then((stat) => {
      if (!stat.isDirectory()) throw new FileSystemError('Not a valid directory');
    })
      .then(() => {
        this.cwd = clientPath;
        return this.currentDirectory();
      });
  }

  write(fileName) {
    const {fsPath, clientPath} = this._resolvePath(fileName);
    const stream = fs.createStreamSync(fsPath, "w+");
    // const stream = createWriteStream(fsPath, {flags: !append ? 'w+' : 'a+', start});
    // stream.once('error', () => fsAsync.unlink(fsPath));
    // stream.once('close', () => stream.end());
    return {
      stream,
      clientPath
    };
  }

  read(fileName) {
    const {fsPath, clientPath} = this._resolvePath(fileName);
    return fs.stat(fsPath).then((stat:fs.Stat) => {
      if (stat.isDirectory()) throw new FileSystemError('Cannot read a directory');
    })
      .then(() => {
        const stream = fs.createStreamSync(fsPath, "r");
        return {
          stream,
          clientPath
        };
      });
  }

  delete(path) {
    const {fsPath} = this._resolvePath(path);
    return fs.stat(fsPath)
      .then((stat) => {
        if (stat.isDirectory()) return fs.rmdir(fsPath);
        else return fs.unlink(fsPath);
      });
  }

  mkdir(path) {
    const {fsPath} = this._resolvePath(path);
    fs.mkdirSync(fsPath, true);
    return fsPath;
  }

  rename(from, to) {
    const {fsPath: fromPath} = this._resolvePath(from);
    const {fsPath: toPath} = this._resolvePath(to);
    return fs.rename(fromPath, toPath);
  }

  size(path) {
    const {fsPath} = this._resolvePath(path);
    let length = fs.statSync(fsPath).size;
    return length;
  }


  getUniqueName() {
    return util.generateRandomUUID(true).replace(/\W/g, '');
  }
}