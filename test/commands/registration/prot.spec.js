const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PROT';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve(),
    server: {},
    secure: true
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

  it('// unsuccessful - no bufferSize', done => {
    mockClient.server._tls = {};

    cmdFn({command: {arg: 'P'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
      done();
    })
    .catch(done);
  });

  it('// successful', done => {
    mockClient.bufferSize = 0;

    cmdFn({command: {arg: 'p'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful - unsupported', done => {
    cmdFn({command: {arg: 'C'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(536);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful - unknown', done => {
    cmdFn({command: {arg: 'QQ'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
      done();
    })
    .catch(done);
  });
});
