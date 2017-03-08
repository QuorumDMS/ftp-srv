const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');
require('sinon-as-promised');

const CMD = 'PWD';
describe(CMD, done => {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: { currentDirectory: () => {} }
  };
  const CMDFN = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves()
    sandbox.stub(mockClient.fs, 'currentDirectory').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('// check', function () {
    it('fails on no fs', done => {
      const badMockClient = { reply: () => {} };
      const BADCMDFN = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();
      BADCMDFN()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(550);
        done();
      })
      .catch(done);
    });

    it('fails on no fs currentDirectory command', done => {
      const badMockClient = { reply: () => {}, fs: {} };
      const BADCMDFN = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();
      BADCMDFN()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(402);
        done();
      })
      .catch(done);
    });
  });

  it('// successful', done => {
    CMDFN({log, command: {_: [CMD, 'test'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(257);
      done();
    })
    .catch(done);
  });

  it('// successful', done => {
    mockClient.fs.currentDirectory.restore();
    sandbox.stub(mockClient.fs, 'currentDirectory').resolves('/test')

    CMDFN({log, command: {_: [CMD, 'test'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(257);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful', done => {
    mockClient.fs.currentDirectory.restore();
    sandbox.stub(mockClient.fs, 'currentDirectory').rejects(new Error('Bad'))

    CMDFN({log, command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });
});
