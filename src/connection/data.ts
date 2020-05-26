import { fromEvent } from 'rxjs';
import { map, timeout, takeUntil, take } from 'rxjs/operators';
import { Socket, createConnection } from 'net';

import {createServer, ServerOptions} from '~/server';

export interface DataConnection extends Socket {

}

export const createDataConnection = () => map<Socket, DataConnection>((socket) => {
  const connection = socket as DataConnection;

  return connection;
});

// Active

export interface ActiveDataConnectionConfig {
  ip: string;
  port: number;
  timeout: number;
}

export const createActiveDataConnection = (config: ActiveDataConnectionConfig) => {
  const connection = createConnection({
    port: config.port,
    host: config.ip,
    family: 4,
    allowHalfOpen: false
  });

  return fromEvent(connection, 'connect', {once: true})
  .pipe(
    timeout(config.timeout),
    createDataConnection()
  )
  .toPromise();
}

// Passive

export interface PassiveDataConnectionConfig extends ServerOptions {
  timeout: number;
}

export const createPassiveDataConnection = (config: PassiveDataConnectionConfig) => {
  const server = createServer(config);
  server.maxConnections = 1;

  const connection = fromEvent(server, 'connection').pipe(
    takeUntil(fromEvent(server, 'close')),
    timeout(config.timeout),
    createDataConnection()
  );

  server.listen(config.port, config.hostname);

  return connection.toPromise();
}
