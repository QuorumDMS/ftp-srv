#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');

const FtpSrv = require('../src');
const errors = require('../src/errors');

const args = setupYargs();
const state = setupState(args);
startFtpServer(state);

function setupYargs() {
  return yargs
    .option('credentials', {
      alias: 'c',
      describe: 'Load user & pass from json file',
      normalize: true
    })
    .option('username', {
      describe: 'Blank for anonymous',
      type: 'string',
      default: ''
    })
    .option('password', {
      describe: 'Password for given username',
      type: 'string'
    })
    .option('root', {
      alias: 'r',
      describe: 'Default root directory for users',
      type: 'string',
      normalize: true
    })
    .option('read-only', {
      describe: 'Disable write actions such as upload, delete, etc',
      boolean: true,
      default: false
    })
    .option('pasv-url', {
      describe: 'URL to provide for passive connections',
      type: 'string',
      alias: 'pasv_url'
    })
    .option('pasv-min', {
      describe: 'Starting point to use when creating passive connections',
      type: 'number',
      default: 1024,
      alias: 'pasv_min'
    })
    .option('pasv-max', {
      describe: 'Ending port to use when creating passive connections',
      type: 'number',
      default: 65535,
      alias: 'pasv_max'
    })
    .parse();
}

function setupState(_args) {
  const _state = {};

  function setupOptions() {
    if (_args._ && _args._.length > 0) {
      _state.url = _args._[0];
    }
    _state.pasv_url = _args.pasv_url;
    _state.pasv_min = _args.pasv_min;
    _state.pasv_max = _args.pasv_max;
    _state.anonymous = _args.username === '';
  }

  function setupRoot() {
    const dirPath = _args.root;
    if (dirPath) {
      _state.root = dirPath;
    } else {
      _state.root = process.cwd();
    }
  }

  function setupCredentials() {
    _state.credentials = {};

    const setCredentials = (username, password, root = null) => {
      _state.credentials[username] = {
        password,
        root
      };
    };

    if (_args.credentials) {
      const credentialsFile = path.resolve(_args.credentials);
      const credentials = require(credentialsFile);

      for (const cred of credentials) {
        setCredentials(cred.username, cred.password, cred.root);
      }
    } else if (_args.username) {
      setCredentials(_args.username, _args.password);
    }
  }

  function setupCommandBlacklist() {
    if (_args.readOnly) {
      _state.blacklist = ['ALLO', 'APPE', 'DELE', 'MKD', 'RMD', 'RNRF', 'RNTO', 'STOR', 'STRU'];
    }
  }

  setupOptions();
  setupRoot();
  setupCredentials();
  setupCommandBlacklist();

  return _state;
}

function startFtpServer(_state) {
  // Remove null/undefined options so they get set to defaults, below
  for (const key in _state) {
    if (_state[key] === undefined) delete _state[key];
  }

  function checkLogin(data, resolve, reject) {
    const user = _state.credentials[data.username];
    if (_state.anonymous || user && user.password === data.password) {
      return resolve({root: user && user.root || _state.root});
    }

    return reject(new errors.GeneralError('Invalid username or password', 401));
  }

  const ftpServer = new FtpSrv({
    url: _state.url,
    pasv_url: _state.pasv_url,
    pasv_min: _state.pasv_min,
    pasv_max: _state.pasv_max,
    anonymous: _state.anonymous,
    blacklist: _state.blacklist
  });

  ftpServer.on('login', checkLogin);
  ftpServer.listen();
}
