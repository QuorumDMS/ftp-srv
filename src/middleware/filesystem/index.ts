import { MiddlewareDefinition } from '~/middleware/types';

export interface FileSystemMiddlewareConfig {
  root: string;
  cwd: string;
}

export const createFileSystemMiddleware = (config: FileSystemMiddlewareConfig): MiddlewareDefinition => (client) => {
  let root = config.root ?? './';
  let cwd = config.cwd ?? '/';

  return {
    PWD() {
      client.send(257, cwd);
    }
  };
};
