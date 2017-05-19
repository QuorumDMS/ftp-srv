const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PBSZ';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve(),
    server: {}
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful', done => {
    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(202);
      done();
    })
    .catch(done);
  });

  it('// successful', done => {
    mockClient.secure = true;
    mockClient.server._tls = {};

    cmdFn({command: {arg: '0'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.bufferSize).to.equal(0);
      done();
    })
    .catch(done);
  });

  it('// successful', done => {
    mockClient.secure = true;
    mockClient.server._tls = {};

    cmdFn({command: {arg: '10'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.bufferSize).to.equal(10);
      done();
    })
    .catch(done);
  });
});
