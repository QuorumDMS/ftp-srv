const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'QUIT';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    close: () => {}
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'close').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', () => {
    return cmdFn(mockClient)
    .then(() => {
      expect(mockClient.close.callCount).to.equal(1);
    });
  });
});
