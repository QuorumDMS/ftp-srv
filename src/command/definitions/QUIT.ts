import { CommandDefinition } from '~/command/types';

/*
230
202
530
500, 501, 503, 421
*/
export const QUIT: CommandDefinition<'QUIT'> = (client) => {
  return {
    setup() {
      // Wait for data connection, then close
      // client.dataconnection.on('close', client.close()) ?
      client.destroy();
    }
  }
}
