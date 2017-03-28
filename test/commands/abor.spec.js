const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'ABOR';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve(),
    connector: {
      waitForConnection: () => when.resolve(),
      end: () => when.resolve()
    }
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.connector, 'waitForConnection');
    sandbox.spy(mockClient.connector, 'end');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful | no active connection', done => {
    mockClient.connector.waitForConnection.restore();
    sandbox.stub(mockClient.connector, 'waitForConnection').rejects();

    cmdFn()
    .then(() => {
      expect(mockClient.connector.waitForConnection.callCount).to.equal(1);
      expect(mockClient.connector.end.callCount).to.equal(0);
      expect(mockClient.reply.args[0][0]).to.equal(226);
      done();
    })
    .catch(done);
  });

  it('// successful | active connection', done => {
    cmdFn()
    .then(() => {
      expect(mockClient.connector.waitForConnection.callCount).to.equal(1);
      expect(mockClient.connector.end.callCount).to.equal(1);
      expect(mockClient.reply.args[0][0]).to.equal(426);
      expect(mockClient.reply.args[1][0]).to.equal(226);
      done();
    })
    .catch(done);
  });
});
