const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const PassiveConnector = require('../../../src/connector/passive');

const CMD = 'EPSV';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(PassiveConnector.prototype, 'setupServer').resolves({
      address: () => ({port: 12345})
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful IPv4', () => {
    return cmdFn()
    .then(() => {
      const [code, message] = mockClient.reply.args[0];
      expect(code).to.equal(229);
      expect(message).to.equal('EPSV OK (|||12345|)');
    });
  });
});
