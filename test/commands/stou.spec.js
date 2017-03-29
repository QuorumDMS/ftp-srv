const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const stor = require('../../src/commands/registration/stor');

const CMD = 'STOU';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.fs = {
      get: () => when.resolve(),
      getUniqueName: () => when.resolve('4')
    };

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'get');
    sandbox.spy(mockClient.fs, 'getUniqueName');

    sandbox.stub(stor.handler, 'call').resolves({});
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no file system', done => {
    delete mockClient.fs;

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | file system does not have functions', done => {
    mockClient.fs = {};

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
      done();
    })
    .catch(done);
  });

  it('// successful | given name is unique', done => {
    mockClient.fs.get.restore();
    sandbox.stub(mockClient.fs, 'get').rejects({});

    cmdFn({ command: { _: [CMD, 'good'] } })
    .then(() => {
      const call = stor.handler.call.args[0][1];
      expect(call).to.have.property('command');
      expect(call.command).to.have.property('_');
      expect(call.command._).to.eql([CMD, 'good']);
      expect(mockClient.fs.getUniqueName.callCount).to.equal(0);
      done();
    })
    .catch(done);
  });

  it('// successful | generates unique name', done => {
    cmdFn({ command: { _: [CMD, 'bad'] } })
    .then(() => {
      const call = stor.handler.call.args[0][1];
      expect(call).to.have.property('command');
      expect(call.command).to.have.property('_');
      expect(call.command._).to.eql([CMD, '4']);
      expect(mockClient.fs.getUniqueName.callCount).to.equal(1);
      done();
    })
    .catch(done);
  });
});
