import { CommandDefinition } from '~/command/types';
import { CommandError, SkipCommandError } from '~/error';

/*
230
202
530
500, 501, 503, 421
332
*/
export const PASS: CommandDefinition<'PASS'> = (client) => {
  return {
    setup(command) {
      if (client.context.get('authenticated') === true) {
        throw new SkipCommandError(202);
      }

      if (client.context.has('password')) {
        throw new CommandError(503, 'Password already set');
      }

      if (!client.context.has('username')) {
        throw new CommandError(503, 'Must send USER');
      }

      const password = command.arg;
      if (!password) {
        throw new CommandError(501, 'Must provide password');
      }

      return {password};
    }
  }
}
