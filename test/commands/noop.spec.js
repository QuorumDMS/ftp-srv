const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon')

const CMD = 'NOOP';
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
    CMDFN()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200)
      done();
    })
    .catch(done);
  })
});
