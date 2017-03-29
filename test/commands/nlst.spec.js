const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'NLST';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: { list: () => {} },
    connector: {
      waitForConnection: () => when({}),
      end: () => {}
    },
    commandSocket: {
      resume: () => {},
      pause: () => {}
    }
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
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
    }]);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('. // successful', done => {
    cmdFn({log, command: {_: [CMD], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(150);
      expect(mockClient.reply.args[1][1]).to.have.property('raw');
      expect(mockClient.reply.args[1][1]).to.have.property('message');
      expect(mockClient.reply.args[1][1]).to.have.property('socket');
      expect(mockClient.reply.args[2][0]).to.equal(226);
      done();
    })
    .catch(done);
  });
});
