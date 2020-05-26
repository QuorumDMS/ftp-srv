import { CommandDefinition } from '~/command/types';
import { CommandError, SkipCommandError } from '~/error';

/*
230
530
500, 501, 421
331, 332
*/
export const USER: CommandDefinition<'USER'> = (client) => {
  return {
    setup(command) {
      if (client.context.get('authenticated') === true) {
        throw new SkipCommandError(230);
      }

      if (client.context.has('username')) {
        throw new CommandError(530, 'Username already set');
      }

      const username = command.arg;
      if (!username) {
        throw new CommandError(501, 'Must provide username');
      }

      return {username};
    }
  }
};
