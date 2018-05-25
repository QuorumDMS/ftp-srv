const net = require('net');
const Queue = require('bee-queue');
const {Signale} = require('signale');
const {matches} = require('z');

const KeyValueStore = require('../utils/keyValueStore');
const {setAsyncTimeout} = require('../utils/setAsyncTimeout')
const {setupWorkers} = require('../workers');

const LISTEN_RETRY_MAX = 2;
const LISTEN_RETRY_DELAY = 1500;

class Server extends net.Server {
  constructor({
    host = '0.0.0.0',
    port = 21,
    log = {}
  } = {}) {
    super({
      pauseOnConnect: true
    });

    this.log = new Signale(Object.assign({
      scope: 'ftp-srv',
    }, log));
    this.debugLog = this.log.scope('debug');
    this.debugLog.config({
      displayTimestamp: true
    })

    this.receiveQueue = new Queue('receive');
    this.sendQueue = new Queue('send');
    this.workers = new KeyValueStore();
    this.options = new KeyValueStore({
      host,
      port
    });
  }

  async listen() {
    const workers = await setupWorkers();
    this.workers.sets(workers);

    const port = this.options.get('port');
    const host = this.options.get('host');

    const tryListen = (retryCount = 1) =>
      new Promise((resolve, reject) => {
        super.once('error', reject);
        super.once('listening', resolve);
        super.listen(port, host);
      })
      .catch(err => matches(err)(
        (e = {code: 'EADDRINUSE'}) => {
          if (retryCount > LISTEN_RETRY_MAX) throw e;

          this.log.error({
            message: `Port (${port}) in use, retrying...`,
            suffix: `${retryCount} / ${LISTEN_RETRY_MAX}`
          });
          return setAsyncTimeout(() => tryListen(++retryCount), LISTEN_RETRY_DELAY);
        },
        (e) => {
          throw e;
        }
      ))
      .catch(async e => {
        await this.close();
        throw e;
      });

    await tryListen();
    return this;
  }

  async close() {
    const tryClose = () => new Promise((resolve) => {
      super.close(err => {
        if (err) {
          this.debugLog.error(err);
        }
        resolve();
      });
    });

    await tryClose();
  }
}

module.exports = Server;
