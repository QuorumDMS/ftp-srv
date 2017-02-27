const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'CDUP';
describe(CMD, done => {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => when.resolve(),
    fs: {
      chdir: () => when.resolve()
    }
  };
  const CMDFN = require(`../../src/commands/${CMD.toLowerCase()}`).bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'chdir');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('.. // successful', done => {
    CMDFN({log, command: {_: [CMD], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.chdir.args[0][0]).to.equal('..');
      done();
    })
    .catch(done);
  });
});
