const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const ActiveConnector = require('../../../src/connector/active');

const CMD = 'EPRT';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
    sandbox.stub(ActiveConnector.prototype, 'setupConnection').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no argument', () => {
    return cmdFn(mockClient)
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
    });
  });

  it('// unsuccessful | invalid argument', () => {
    return cmdFn(mockClient, {arg: 'blah'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
    });
  });

  it('// successful IPv4', () => {
    return cmdFn(mockClient, {arg: '|1|192.168.0.100|35286|'})
    .then(() => {
      const [ip, port, family] = ActiveConnector.prototype.setupConnection.args[0];
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(ip).to.equal('192.168.0.100');
      expect(port).to.equal('35286');
      expect(family).to.equal(4);
    });
  });

  it('// successful IPv6', () => {
    return cmdFn(mockClient, {arg: '|2|8536:933f:e7f3:3e91:6dc1:e8c6:8482:7b23|35286|'})
    .then(() => {
      const [ip, port, family] = ActiveConnector.prototype.setupConnection.args[0];
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(ip).to.equal('8536:933f:e7f3:3e91:6dc1:e8c6:8482:7b23');
      expect(port).to.equal('35286');
      expect(family).to.equal(6);
    });
  });
});
