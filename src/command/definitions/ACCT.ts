import { CommandDefinition } from '~/command/types';
import { CommandError, SkipCommandError } from '~/error';

/*
230
202
530
500, 501, 503, 421
*/
export const ACCT: CommandDefinition<'ACCT'> = (client) => {
  return {
    setup(command) {
      if (client.context.get('authenticated') === true) {
        throw new SkipCommandError(202);
      }

      if (client.context.has('account')) {
        throw new CommandError(503, 'Account already set');
      }

      if (!client.context.has('username')) {
        throw new CommandError(503, 'Must send USER');
      }

      if (!client.context.has('password')) {
        throw new CommandError(503, 'Must send PASS');
      }

      const account = command.arg;
      if (!account) {
        throw new CommandError(501, 'Must provide account');
      }

      return {account};
    }
  }
}
