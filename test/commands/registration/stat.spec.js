const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'STAT';
describe(CMD, function () {
  let sandbox;
  const mockLog = { error: () => {} };
  const mockClient = { reply: () => when.resolve() };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.fs = {
      get: () => when.resolve({}),
      list: () => when.resolve([])
    };

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', done => {
    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(211);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | no file system', done => {
    delete mockClient.fs;

    cmdFn({ command: { arg: 'test' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | file system does not have functions', done => {
    mockClient.fs = {};

    cmdFn({ command: { arg: 'test' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | file get fails', done => {
    sandbox.stub(mockClient.fs, 'get').rejects(new Error('test'));

    cmdFn({ log: mockLog, command: { arg: 'test' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(450);
      done();
    })
    .catch(done);
  });

  it('// successful | file', done => {
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

    cmdFn({ command: { arg: 'test' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(212);
      done();
    })
    .catch(done);
  });

  it('// successful | directory', done => {
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

    cmdFn({ command: { arg: 'test' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(213);
      done();
    })
    .catch(done);
  });
});
