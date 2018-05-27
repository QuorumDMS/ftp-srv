const {expect} = require('chai');

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
      expect(result.serverPath).to.equal('/file/1/2/3/');
      expect(result.fsPath).to.equal('/tmp/ftp-srv/file/1/2/3/');
    });

    it('gets correct relative path', function () {
      const result = fs._resolvePath('..');
      expect(result).to.be.an('object');
      expect(result.serverPath).to.equal('/file/1/2/');
      expect(result.fsPath).to.equal('/tmp/ftp-srv/file/1/2/');
    });

    it('gets correct absolute path', function () {
      const result = fs._resolvePath('/other');
      expect(result).to.be.an('object');
      expect(result.serverPath).to.equal('/other/');
      expect(result.fsPath).to.equal('/tmp/ftp-srv/other/');
    });

    it('cannot escape root', function () {
      const result = fs._resolvePath('../../../../../../../../../../../');
      expect(result).to.be.an('object');
      expect(result.serverPath).to.equal('/');
      expect(result.fsPath).to.equal('/tmp/ftp-srv/');
    });
  });
});
