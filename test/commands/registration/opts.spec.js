const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'OPTS';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful', () => {
    return cmdFn(mockClient)
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(501);
    });
  });

  it('BAD // unsuccessful', () => {
    return cmdFn(mockClient, {arg: 'BAD', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(500);
    });
  });

  it('UTF8 BAD // unsuccessful', () => {
    return cmdFn(mockClient, {arg: 'UTF8 BAD', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(501);
    });
  });

  it('UTF8 OFF // successful', () => {
    return cmdFn(mockClient, {arg: 'UTF8 OFF', directive: CMD})
    .then(() => {
      expect(mockClient.encoding).to.equal('ascii');
      expect(mockClient.reply.args[0][0]).to.equal(200);
    });
  });

  it('UTF8 ON // successful', () => {
    return cmdFn(mockClient, {arg: 'UTF8 ON', directive: CMD})
    .then(() => {
      expect(mockClient.encoding).to.equal('utf8');
      expect(mockClient.reply.args[0][0]).to.equal(200);
    });
  });
});
