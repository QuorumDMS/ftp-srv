import { MiddlewareDefinition } from '~/middleware/types';

interface GreetingMiddlewareConfig {
  message: string;
}

export const createGreetingMiddleware = (config: GreetingMiddlewareConfig): MiddlewareDefinition => (client) => {
  // TODO: features flags?
  client.send(220, config.message);

  return {};
};
