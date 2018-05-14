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
      type: 'string'
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
    .parse();
}

function setupState(_args) {
  const _state = {};

  function setupOptions() {
    if (_args._ && _args._.length > 0) {
      _state.url = _args._[0];
    }
    _state.anonymous = _args.username === '';
  }

  function setupRoot() {
    const dirPath = _args.root;
    if (dirPath) {
      _state.root = process.cwd();
    } else {
      _state.root = dirPath;
    }
  }

  function setupCredentials() {
    _state.credentials = {};

    const setCredentials = (username, password, root = null) => {
      _state.credentials[_state.credentials] = {
        password,
        root
      };
    };

    if (_args.credentials) {
      const credentialsFile = path.resolve(_args.credentials);
      const credentials = require(credentialsFile);

      for (const cred of Object.entries(credentials)) {
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

  function checkLogin(data, resolve, reject) {
    const {password, root} = _state.credentials[data.username];
    if (_state.anonymous || password === data.password) {
      return resolve({root: root || _state.root});
    }

    return reject(new errors.GeneralError('Invalid username or password', 401));
  }

  const ftpServer = new FtpSrv(_state.url, {
    anonymous: _state.anonymous,
    blacklist: _state.blacklist
  });

  ftpServer.on('login', checkLogin);
  ftpServer.listen();
}
