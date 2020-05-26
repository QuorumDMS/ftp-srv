const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const stor = require('../../../src/commands/registration/stor');

const CMD = 'STOU';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    mockClient.fs = {
      get: () => Promise.resolve(),
      getUniqueName: () => Promise.resolve('4')
    };

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'get');
    sandbox.spy(mockClient.fs, 'getUniqueName');

    sandbox.stub(stor.handler, 'call').resolves({});
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no file system', () => {
    delete mockClient.fs;

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('// unsuccessful | file system does not have functions', () => {
    mockClient.fs = {};

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
    });
  });

  it('// successful | given name is unique', () => {
    mockClient.fs.get.restore();
    sandbox.stub(mockClient.fs, 'get').rejects({});

    return cmdFn({command: {arg: 'good'}})
    .then(() => {
      const call = stor.handler.call.args[0][1];
      expect(call).to.have.property('command');
      expect(call.command).to.have.property('arg');
      expect(call.command.arg).to.eql('good');
      expect(mockClient.fs.getUniqueName.callCount).to.equal(0);
    });
  });

  it('// successful | generates unique name', () => {
    return cmdFn({command: {arg: 'bad'}})
    .then(() => {
      const call = stor.handler.call.args[0][1];
      expect(call).to.have.property('command');
      expect(call.command).to.have.property('arg');
      expect(call.command.arg).to.eql('4');
      expect(mockClient.fs.getUniqueName.callCount).to.equal(1);
    });
  });
});
