import { CommandDefinition } from '~/command/types';
import { CommandError } from '~/error';

export const PASV: CommandDefinition<'PASV'> = () => {
  return {
    setup(command) {

    }
  }
}
