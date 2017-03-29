const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'OPTS';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', done => {
    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(501);
      done();
    })
    .catch(done);
  });
});
