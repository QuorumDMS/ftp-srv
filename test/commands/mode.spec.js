const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon')

const CMD = 'MODE';
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

  it('S // successful', done => {
    CMDFN({command: {_: [CMD, 'S']}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200)
      done();
    })
    .catch(done);
  });

  it('Q // unsuccessful', done => {
    CMDFN({command: {_: [CMD, 'Q']}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504)
      done();
    })
    .catch(done);
  });
});
