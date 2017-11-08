/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const sinon = require('sinon');
const bunyan = require('bunyan');
const when = require('when');
const _ = require('lodash');
const fs = require('fs');
const mockFs = require('mock-fs');

const FtpServer = require('../src');
const FtpClient = require('@icetee/ftp');

describe('Integration', function () {
  this.timeout(4000);

  let client;
  let sandbox;
  let log = bunyan.createLogger({name: 'test-runner'});
  let server;

  let connection;
  const clientDirectory = `${process.cwd()}/test_tmp`;

  before(() => {
    return startServer('ftp://127.0.0.1:8880');
  });
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  after(() => {
    server.close();
  });

  function startServer(url, options = {}) {
    server = new FtpServer(url, _.assign({
      log,
      pasv_range: 8881,
      greeting: ['hello', 'world'],
      anonymous: true
    }, options));
    server.on('login', (data, resolve) => {
      connection = data.connection;
      resolve({root: clientDirectory});
    });

    return server.listen();
  }

  function connectClient(options = {}) {
    return when.promise((resolve, reject) => {
      client = new FtpClient();
      client.once('ready', () => resolve(client));
      client.once('error', err => reject(err));
      client.connect(_.assign({
        host: server.url.hostname,
        port: server.url.port,
        user: 'test',
        password: 'test'
      }, options));
    })
    .then(instance => {
      client = instance;
    });
  }

  function closeClient() {
    return when.promise((resolve, reject) => {
      client.once('close', () => resolve());
      client.once('error', err => reject(err));
      client.logout(err => {
        expect(err).to.be.undefined;
      });
    });
  }

  function runFileSystemTests() {
    before(() => mockFs({
      [clientDirectory]: mockFs.directory(),
      [`${clientDirectory}/dir`]: mockFs.directory(),
      [`${clientDirectory}/dir/fake.txt`]: mockFs.file()
    }));

    after(() => mockFs.restore());

    it('STAT', done => {
      client.status((err, status) => {
        expect(err).to.not.exist;
        expect(status).to.equal('Status OK');
        done();
      });
    });

    it('SYST', done => {
      client.system((err, os) => {
        expect(err).to.not.exist;
        expect(os).to.equal('UNIX');
        done();
      });
    });

    it('CWD ..', done => {
      client.cwd('..', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.equal('/');
        done();
      });
    });

    it('CWD dir', done => {
      client.cwd('dir', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.equal('/dir');
        done();
      });
    });

    it('PWD', done => {
      client.pwd((err, data) => {
        expect(err).to.not.exist;
        expect(data).to.equal('/dir');
        done();
      });
    });

    it('LIST .', done => {
      client.list('.', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.be.an('array');
        expect(data.length).to.equal(1);
        expect(data[0].name).to.equal('fake.txt');
        done();
      });
    });

    it('LIST fake.txt', done => {
      client.list('fake.txt', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.be.an('array');
        expect(data.length).to.equal(1);
        expect(data[0].name).to.equal('fake.txt');
        done();
      });
    });

    it('STOR fail.txt', done => {
      const fsPath = `${clientDirectory}/dir/fail.txt`;
      sandbox.stub(connection.fs, 'write').callsFake(function () {
        const stream = fs.createWriteStream(fsPath, {flags: 'w+'});
        stream.once('error', () => fs.unlinkSync(fsPath));
        setTimeout(() => stream.emit('error', new Error('STOR fail test'), 1));
        return stream;
      });
      const buffer = Buffer.from('test text file');
      client.put(buffer, 'fail.txt', err => {
        expect(err).to.exist;
        expect(fs.existsSync(fsPath)).to.equal(false);
        done();
      });
    });

    it('STOR tést.txt', done => {
      const buffer = Buffer.from('test text file');
      const fsPath = `${clientDirectory}/dir/tést.txt`;
      client.put(buffer, 'tést.txt', err => {
        expect(err).to.not.exist;
        setTimeout(() => {
          expect(fs.existsSync(fsPath)).to.equal(true);
          fs.readFile(fsPath, (fserr, data) => {
            expect(fserr).to.not.exist;
            expect(data.toString()).to.equal('test text file');
            done();
          });
        });
      });
    });

    it('APPE tést.txt', done => {
      const buffer = Buffer.from(', awesome!');
      const fsPath = `${clientDirectory}/dir/tést.txt`;
      client.append(buffer, 'tést.txt', err => {
        expect(err).to.not.exist;
        setTimeout(() => {
          expect(fs.existsSync(fsPath)).to.equal(true);
          fs.readFile(fsPath, (fserr, data) => {
            expect(fserr).to.not.exist;
            expect(data.toString()).to.equal('test text file, awesome!');
            done();
          });
        });
      });
    });

    it('RETR tést.txt', done => {
      client.get('tést.txt', (err, stream) => {
        expect(err).to.not.exist;
        let text = '';
        stream.on('data', data => {
          text += data.toString();
        });
        stream.on('end', () => {
          expect(text).to.equal('test text file, awesome!');
          done();
        });
        stream.resume();
      });
    });

    it('RNFR tést.txt, RNTO awesome.txt', done => {
      client.rename('tést.txt', 'awesome.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync(`${clientDirectory}/dir/tést.txt`)).to.equal(false);
        expect(fs.existsSync(`${clientDirectory}/dir/awesome.txt`)).to.equal(true);
        fs.readFile(`${clientDirectory}/dir/awesome.txt`, (fserr, data) => {
          expect(fserr).to.not.exist;
          expect(data.toString()).to.equal('test text file, awesome!');
          done();
        });
      });
    });

    it('SIZE awesome.txt', done => {
      client.size('awesome.txt', (err, size) => {
        expect(err).to.not.exist;
        expect(size).to.be.a('number');
        done();
      });
    });

    it('MDTM awesome.txt', done => {
      client.lastMod('awesome.txt', (err, modTime) => {
        expect(err).to.not.exist;
        expect(modTime).to.be.instanceOf(Date);
        expect(modTime.toISOString()).to.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
        done();
      });
    });

    it.skip('MLSD .', done => {
      client.mlsd('.', () => {
        done();
      });
    });

    it('SITE CHMOD 700 awesome.txt', done => {
      client.site('CHMOD 600 awesome.txt', err => {
        expect(err).to.not.exist;
        fs.stat(`${clientDirectory}/dir/awesome.txt`, (fserr, stats) => {
          expect(fserr).to.not.exist;
          const mode = stats.mode.toString(8);
          expect(/600$/.test(mode)).to.equal(true);
          done();
        });
      });
    });

    it('DELE awesome.txt', done => {
      client.delete('awesome.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync(`${clientDirectory}/dir/awesome.txt`)).to.equal(false);
        done();
      });
    });

    it('MKD témp', done => {
      const path = `${clientDirectory}/dir/témp`;
      if (fs.existsSync(path)) {
        fs.rmdirSync(path);
      }
      client.mkdir('témp', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync(path)).to.equal(true);
        done();
      });
    });

    it('CWD témp', done => {
      client.cwd('témp', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.to.be.a('string');
        done();
      });
    });

    it('CDUP', done => {
      client.cdup(err => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('RMD témp', done => {
      client.rmdir('témp', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync(`${clientDirectory}/dir/témp`)).to.equal(false);
        done();
      });
    });

    it('CDUP', done => {
      client.cdup(err => {
        expect(err).to.not.exist;
        done();
      });
    });
  }

  describe('#ASCII', function () {
    before(() => {
      return connectClient({
        host: server.url.hostname,
        port: server.url.port,
        user: 'test',
        password: 'test'
      });
    });

    after(() => closeClient(client));

    it('TYPE A', done => {
      client.ascii(err => {
        expect(err).to.not.exist;
        done();
      });
    });

    runFileSystemTests();
  });

  describe('#BINARY', function () {
    before(() => {
      return connectClient({
        host: server.url.hostname,
        port: server.url.port,
        user: 'test',
        password: 'test'
      });
    });

    after(() => closeClient(client));

    it('TYPE I', done => {
      client.binary(err => {
        expect(err).to.not.exist;
        done();
      });
    });

    runFileSystemTests();
  });

  describe.skip('#EXPLICIT', function () {
    before(() => {
      return server.close()
      .then(() => startServer('ftp://127.0.0.1:8880', {
        tls: {
          key: `${process.cwd()}/test/cert/server.key`,
          cert: `${process.cwd()}/test/cert/server.crt`,
          ca: `${process.cwd()}/test/cert/server.csr`
        }
      }))
      .then(() => {
        return connectClient({
          secure: true,
          secureOptions: {
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined
          }
        });
      });
    });

    after(() => closeClient());

    runFileSystemTests();
  });

  describe.skip('#IMPLICIT', function () {
    before(() => {
      return server.close()
      .then(() => startServer('ftps://127.0.0.1:8880', {
        tls: {
          key: `${process.cwd()}/test/cert/server.key`,
          cert: `${process.cwd()}/test/cert/server.crt`,
          ca: `${process.cwd()}/test/cert/server.csr`
        }
      }))
      .then(() => {
        return connectClient({
          secure: 'implicit',
          secureOptions: {
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined
          }
        });
      });
    });

    after(() => closeClient());

    runFileSystemTests();
  });
});
