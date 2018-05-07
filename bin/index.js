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
    .option('url', {
      alias: 'u',
      default: 'ftp://0.0.0.0:9876',
      describe: '{ftp|ftps}://{url}:[port]',
      type: 'string'
    })
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
    .option('read-only', {
      describe: 'Disable upload',
      boolean: true,
      default: false
    })
    .parse();
}

function setupState(_args) {
  const _state = {};

  function setupOptions() {
    _state.url = _args.url;
    _state.anonymous = _args.username === '';
  }

  function setupRoot() {
    const dirPath = _args._;
    if (dirPath.length === 0) {
      _state.root = process.cwd();
    } else {
      _state.root = dirPath[0];
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
