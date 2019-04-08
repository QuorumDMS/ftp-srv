const {expect} = require('chai');
const escapePath = require('../../src/helpers/escape-path');

describe('helpers // escape-path', function () {
  it('escapes quotes', () => {
    const string = '"test"';
    const escapedString = escapePath(string);
    expect(escapedString).to.equal('""test""');
  });
});
