const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');
require('sinon-as-promised')(when.Promise);

const CMD = 'MDTM';
describe(CMD, done => {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: { get: () => {} }
  };
  const mockSocket = {};
  const CMDFN = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient.fs, 'get').resolves({mtime: 'Mon, 10 Oct 2011 23:24:11 GMT'});
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

    it('fails on no fs get command', done => {
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

  it('. // successful', done => {
    CMDFN({log, command: {_: [CMD], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(213);
      //expect(mockClient.reply.args[0][1]).to.equal('20111010172411.000');
      done();
    })
    .catch(done);
  });

  it('. // unsuccessful', done => {
    mockClient.fs.get.restore();
    sandbox.stub(mockClient.fs, 'get').rejects(new Error());

    CMDFN({log, command: {_: [CMD], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });
});
