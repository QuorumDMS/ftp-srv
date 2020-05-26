import {createServer as createInsecureServer} from 'net';
import {createServer as createSecureServer, TlsOptions} from 'tls';

export type ServerSecureOptions = {
  secure?: boolean;
  tls?: TlsOptions;
}

export type ServerOptions = {
  port: number;
  hostname?: string;
} & ServerSecureOptions

export function createServer(config: ServerSecureOptions) {
  const serverOptions = {
    allowHalfOpen: false,
    pauseOnConnect: true
  };

  if (config.secure === true && config.tls) {
    return createSecureServer({
      ...serverOptions,
      ...config.tls
    });
  } else {
    return createInsecureServer({
      ...serverOptions
    });
  }
}
