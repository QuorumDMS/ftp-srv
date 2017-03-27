const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'TYPE';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.encoding = null;
    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('A // successful', done => {
    cmdFn({ command: { _: [CMD, 'A'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.encoding).to.equal('utf-8');
      done();
    })
    .catch(done);
  });

  it('I // successful', done => {
    cmdFn({ command: { _: [CMD, 'I'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.encoding).to.equal('binary');
      done();
    })
    .catch(done);
  });

  it('L // successful', done => {
    cmdFn({ command: { _: [CMD, 'L'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.encoding).to.equal('binary');
      done();
    })
    .catch(done);
  });

  it('X // successful', done => {
    cmdFn({ command: { _: [CMD, 'X'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(501);
      expect(mockClient.encoding).to.equal(null);
      done();
    })
    .catch(done);
  });
});
