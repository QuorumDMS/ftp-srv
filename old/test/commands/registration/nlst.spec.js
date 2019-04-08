const Promise = require('bluebird');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'NLST';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: {
      get: () => {},
      list: () => {}
    },
    connector: {
      waitForConnection: () => Promise.resolve({}),
      end: () => Promise.resolve({})
    },
    commandSocket: {
      resume: () => {},
      pause: () => {}
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient.fs, 'get').resolves({
      name: 'testdir',
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
    sandbox.stub(mockClient.fs, 'list').resolves([{
      name: 'test1',
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
    }, {
      name: 'test2',
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
    }]);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('. // successful', () => {
    return cmdFn({log, command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(150);
      expect(mockClient.reply.args[1].length).to.equal(3);
      expect(mockClient.reply.args[1][1]).to.have.property('raw');
      expect(mockClient.reply.args[1][1]).to.have.property('message');
      expect(mockClient.reply.args[1][1]).to.have.property('socket');
      expect(mockClient.reply.args[2][0]).to.equal(226);
    });
  });

  it('testfile.txt // successful', () => {
    mockClient.fs.get.restore();
    sandbox.stub(mockClient.fs, 'get').resolves({
      name: 'testfile.txt',
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

    return cmdFn({log, command: {directive: CMD, arg: 'testfile.txt'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(150);
      expect(mockClient.reply.args[1].length).to.equal(2);
      expect(mockClient.reply.args[1][1]).to.have.property('raw');
      expect(mockClient.reply.args[1][1]).to.have.property('message');
      expect(mockClient.reply.args[1][1]).to.have.property('socket');
      expect(mockClient.reply.args[2][0]).to.equal(226);
    });
  });
});
