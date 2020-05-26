import { CommandDefinition } from '~/command/types';
import { getDefaultContext } from '~/connection/command';

/*
120
    220
220
421
500, 502
*/
export const REIN: CommandDefinition<'REIN'> = (client) => {
  return {
    setup() {
      client.context = getDefaultContext();
    }
  }
}
