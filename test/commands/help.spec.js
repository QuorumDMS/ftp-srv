const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon')

const CMD = 'HELP';
describe(CMD, done => {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const CMDFN = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', done => {
    CMDFN({command: {_: [CMD], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(211);
      done();
    })
    .catch(done);
  });

  it('help // successful', done => {
    CMDFN({command: {_: [CMD, 'help'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(214);
      done();
    })
    .catch(done);
  });

  it('help // successful', done => {
    CMDFN({command: {_: [CMD, 'allo'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(214);
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    CMDFN({command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(502);
      done();
    })
    .catch(done);
  });
});
