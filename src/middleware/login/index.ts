import { MiddlewareDefinition } from '~/middleware/types';
import { OrPromise } from '~/types';

type Authentication = (username: string, password?: string, account?: string) => OrPromise<boolean>;

interface LoginMiddlewareConfig {
  requirePassword: boolean;
  requireAccount: boolean;
}

export const createLoginMiddleware = (authenticate: Authentication, config: LoginMiddlewareConfig): MiddlewareDefinition => (client) => ({
  async USER(context) {
    if (!config.requirePassword) {
      if (config.requireAccount) {
        client.send(332, 'Need account for login.');
        return;
      }

      const valid = await authenticate(context.username);
      if (!valid) {
        client.send(530, 'Invalid credentials');
        return;
      }

      client.context.set('username', context.username);
      client.context.set('authenticated', true);
      client.send(230, 'User logged in, proceed.');
      return;
    }

    client.context.set('username', context.username);
    client.send(331, 'User name okay, need password.');
  },
  async PASS(context) {
    if (config.requireAccount) {
      client.context.set('password', context.password);
      client.send(332, 'Need account for login.');
      return;
    }

    const valid = await authenticate(client.context.get('username'), context.password);
    if (!valid) {
      client.context.delete('username');
      client.send(530, 'Invalid credentials');
      return;
    }

    client.context.set('password', context.password);
    client.context.set('authenticated', true);
    client.send(230, 'User logged in, proceed.');
    return;
  },
  async ACCT(context) {
    const valid = await authenticate(
      client.context.get('username'),
      client.context.get('password'),
      context.account
    );
    if (!valid) {
      client.context.delete('username');
      client.context.delete('password');
      client.send(530, 'Invalid credentials');
      return;
    }

    client.context.set('account', context.account);
    client.context.set('authenticated', true);
    client.send(230, 'User logged in, proceed.');
  }
});
