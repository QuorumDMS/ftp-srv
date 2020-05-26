import {Server} from 'net';
import {promisify} from 'util';

import { fromEvent, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { createCommandConnection, resumeCommandConnection, CommandConnection } from '~/connection/command';

import { MiddlewareDefinition } from './middleware/types';
import { ServerOptions, createServer } from './server';

export default class FTPServer {
  private server: Server;
  private connectionSubject: Subject<CommandConnection>;

  public constructor(private config: ServerOptions) {
    this.server = createServer(this.config);
    this.connectionSubject = new Subject()

    fromEvent(this.server, 'connection').pipe(
      takeUntil(fromEvent(this.server, 'close')),
      map(createCommandConnection)
    )
    .subscribe(this.connectionSubject);
  }

  public close = () => promisify(this.server.close)();

  public listen() {
    this.server.listen(this.config.port, this.config.hostname);
    this.connectionSubject.subscribe(resumeCommandConnection);
  }

  public use(ware: MiddlewareDefinition) {
    this.connectionSubject.subscribe((client) => client.use(ware));
    return this;
  }
}

export function createFTPServer(...args: ConstructorParameters<typeof FTPServer>) {
  return new FTPServer(...args);
}
