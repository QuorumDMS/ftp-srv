import { CommandDefinition } from '~/command/types';
import { CommandError } from '~/error';

export const PORT: CommandDefinition<'PORT'> = () => {
  return {
    setup(command) {
      const connection = command.arg.split(',');
      if (connection.length !== 6) {
        throw new CommandError(425, 'Unable to open data connection');
      }

      const ip = connection.slice(0, 4).join('.');
      const portBytes = connection.slice(4).map((p) => parseInt(p));
      const port = portBytes[0] * 256 + portBytes[1];

      return {
        ip,
        port
      };
    }
  }
}
