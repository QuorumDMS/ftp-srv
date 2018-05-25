const path = require('path');
const {fork} = require('child_process');

async function setupWorkers() {
  const commandWorkerPath = path.resolve(__dirname, './command/index.js');
  const dataWorkerPath = path.resolve(__dirname, './data/index.js');

  const commandWorker = fork(commandWorkerPath, [], {});
  const dataWorker = fork(dataWorkerPath, [], {});

  return {
    command: commandWorker,
    data: dataWorker
  }
}

module.exports = {
  setupWorkers
};
