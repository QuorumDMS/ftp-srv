const {expect} = require('chai');
const nodePath = require('path');

const FileSystem = require('../src/fs');

describe('FileSystem', function () {
  let fs;

  before(function () {
    fs = new FileSystem({}, {
      root: '/tmp/ftp-srv',
      cwd: 'file/1/2/3'
    });
  });

  describe('#_resolvePath', function () {
    it('gets correct relative path', function () {
      const result = fs._resolvePath();
      expect(result).to.be.an('object');
      expect(result.clientPath).to.equal(
        nodePath.normalize('/file/1/2/3'));
      expect(result.fsPath).to.equal(
        nodePath.resolve('/tmp/ftp-srv/file/1/2/3'));
    });

    it('gets correct relative path', function () {
      const result = fs._resolvePath('..');
      expect(result).to.be.an('object');
      expect(result.clientPath).to.equal(
        nodePath.normalize('/file/1/2'));
      expect(result.fsPath).to.equal(
        nodePath.resolve('/tmp/ftp-srv/file/1/2'));
    });

    it('gets correct absolute path', function () {
      const result = fs._resolvePath('/other');
      expect(result).to.be.an('object');
      expect(result.clientPath).to.equal(
        nodePath.normalize('/other'));
      expect(result.fsPath).to.equal(
        nodePath.resolve('/tmp/ftp-srv/other'));
    });

    it('cannot escape root', function () {
      const result = fs._resolvePath('../../../../../../../../../../..');
      expect(result).to.be.an('object');
      expect(result.clientPath).to.equal(
        nodePath.normalize('/'));
      expect(result.fsPath).to.equal(
        nodePath.resolve('/tmp/ftp-srv'));
    });

    it('resolves to file', function () {
      const result = fs._resolvePath('/cool/file.txt');
      expect(result).to.be.an('object');
      expect(result.clientPath).to.equal(
        nodePath.normalize('/cool/file.txt'));
      expect(result.fsPath).to.equal(
        nodePath.resolve('/tmp/ftp-srv/cool/file.txt'));
    });
  });
});
