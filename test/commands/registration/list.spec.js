const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'LIST';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: {
      list: () => {},
      get: () => {}
    },
    connector: {
      waitForConnection: () => when({}),
      end: () => {}
    },
    commandSocket: {
      resume: () => {},
      pause: () => {}
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

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

  describe('// check', function () {
    it('fails on no fs', done => {
      const badMockClient = { reply: () => {} };
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();
      badCmdFn()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(550);
        done();
      })
      .catch(done);
    });

    it('fails on no fs list command', done => {
      const badMockClient = { reply: () => {}, fs: {} };
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();
      badCmdFn()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(402);
        done();
      })
      .catch(done);
    });
  });

  it('. // successful', done => {
    cmdFn({log, command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(150);
      expect(mockClient.reply.args[1].length).to.equal(3);
      expect(mockClient.reply.args[1][1]).to.have.property('raw');
      expect(mockClient.reply.args[1][1]).to.have.property('message');
      expect(mockClient.reply.args[1][1]).to.have.property('socket');
      expect(mockClient.reply.args[2][0]).to.equal(226);
      done();
    })
    .catch(done);
  });

  it('testfile.txt // successful', done => {
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

    cmdFn({log, command: {directive: CMD, arg: 'testfile.txt'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(150);
      expect(mockClient.reply.args[1].length).to.equal(2);
      expect(mockClient.reply.args[1][1]).to.have.property('raw');
      expect(mockClient.reply.args[1][1]).to.have.property('message');
      expect(mockClient.reply.args[1][1]).to.have.property('socket');
      expect(mockClient.reply.args[2][0]).to.equal(226);
      done();
    })
    .catch(done);
  });

  it('. // unsuccessful', done => {
    mockClient.fs.list.restore();
    sandbox.stub(mockClient.fs, 'list').rejects(new Error());

    cmdFn({log, command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(451);
      done();
    })
    .catch(done);
  });

  it('. // unsuccessful (timeout)', done => {
    sandbox.stub(mockClient.connector, 'waitForConnection').returns(when.reject(new when.TimeoutError()));

    cmdFn({log, command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(425);
      done();
    })
    .catch(done);
  });
});
