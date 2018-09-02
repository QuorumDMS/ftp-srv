const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'STAT';
describe(CMD, function () {
  let sandbox;
  const mockLog = {error: () => {}};
  const mockClient = {reply: () => Promise.resolve()};
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    mockClient.fs = {
      get: () => Promise.resolve({}),
      list: () => Promise.resolve([])
    };

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', () => {
    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(211);
    });
  });

  it('// unsuccessful | no file system', () => {
    delete mockClient.fs;

    return cmdFn({command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('// unsuccessful | file system does not have functions', () => {
    mockClient.fs = {};

    return cmdFn({command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
    });
  });

  it('// unsuccessful | file get fails', () => {
    sandbox.stub(mockClient.fs, 'get').rejects(new Error('test'));

    return cmdFn({log: mockLog, command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(450);
    });
  });

  it('// successful | file', () => {
    sandbox.stub(mockClient.fs, 'get').returns({
      name: 'test_file',
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 527,
      blksize: 4096,
      blocks: 8,
      atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      isDirectory: () => false
    });

    return cmdFn({command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(212);
    });
  });

  it('// successful | directory', () => {
    sandbox.stub(mockClient.fs, 'list').returns([{
      name: 'test_file',
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 527,
      blksize: 4096,
      blocks: 8,
      atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      isDirectory: () => false
    }]);

    sandbox.stub(mockClient.fs, 'get').returns({
      name: 'test_directory',
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 527,
      blksize: 4096,
      blocks: 8,
      atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      isDirectory: () => true
    });

    return cmdFn({command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(213);
    });
  });
});
