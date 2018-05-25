const net = require('net');
const path = require('path');
const {fork} = require('child_process');
const Queue = require('bee-queue');

const Client = require('./Client');
const ConnectionManager = require('./ConnectionManager');
const {idGenerator} = require('./utils/idGenerator');
const message = require('./const/message');

class Server extends net.Server {
  constructor() {
    super({pauseOnConnect: true});

    this.connectionManager = new ConnectionManager();
    this.clientIDGenerator = idGenerator(1);
    this.receiveQueue = new Queue('receive');
    this.sendQueue = new Queue('send');

    this.on('connection', socket => this._onConnection(socket));
  }

  async send(client, data) {
    const job = await this.sendQueue.createJob({
      id: client.id,
      data
    })
    .timeout(30000)
    .save();
  }

  async close() {
    await this.connectionManager.invoke('close');
    await new Promise(resolve => super.close(() => resolve()));
    return this;
  }

  async listen(port) {
    // const processor = path.resolve(__dirname, './commands/processor.js');
    // this.commandProcess = fork(processor, {
    //   stdio: 'pipe'
    // });
    // this.commandProcess.on('message', (message) => {
    //   console.log('got', message)
    // });
    // this.commandProcess.on('error', (err) => {
    //   console.log('error', err)
    // });
    // this.commandProcess.once('exit', (code) => {
    //   console.log('exit', code)
    // });
    // this.commandProcess.once('close', (code) => {
    //   console.log('close', code)
    // });
    this.commandProcess.send('server', this);

    await new Promise(resolve => super.listen(port, () => resolve()));
    return this;
  }

  _onConnection(socket) {
    const id = this.clientIDGenerator.next().value;
    const client = new Client(id, socket);
    client.once('close', () => this.connectionManager.remove(client.id));

    this.connectionManager.add(id, client);
    this.emit('client', client);

    // client.send(message.GREETING)
    // .then(() => client.resume())
    // .catch(() => client.close());
  }
}

module.exports = Server;
