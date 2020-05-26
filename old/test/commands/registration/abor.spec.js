const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'ABOR';
describe.skip(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve(),
    connector: {
      waitForConnection: () => Promise.resolve(),
      end: () => Promise.resolve()
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.connector, 'waitForConnection');
    sandbox.spy(mockClient.connector, 'end');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful | no active connection', () => {
    mockClient.connector.waitForConnection.restore();
    sandbox.stub(mockClient.connector, 'waitForConnection').rejects();

    return cmdFn()
    .then(() => {
      expect(mockClient.connector.waitForConnection.callCount).to.equal(1);
      expect(mockClient.connector.end.callCount).to.equal(0);
      expect(mockClient.reply.args[0][0]).to.equal(225);
    });
  });

  it('// successful | active connection', () => {
    return cmdFn()
    .then(() => {
      expect(mockClient.connector.waitForConnection.callCount).to.equal(1);
      expect(mockClient.connector.end.callCount).to.equal(1);
      expect(mockClient.reply.args[0][0]).to.equal(426);
      expect(mockClient.reply.args[1][0]).to.equal(226);
    });
  });
});
