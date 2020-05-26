import { CommandDefinition } from '~/command/types';

/*
215
500, 501, 502, 421
*/
export const SYST: CommandDefinition<'SYST'> = (client) => {
  return {
    setup() {
      client.send(215, 'UNIX Type: L8');
    }
  }
}
