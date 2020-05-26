import { Socket } from "net";

import { fromEvent, Subject, from } from 'rxjs';
import { takeUntil, map, tap, filter, switchMap } from 'rxjs/operators';

import { parseCommandString, getCommandContext } from '~/command';
import { Command } from "~/command/types";
import { formatReply } from "~/reply";
import { MiddlewareDefinition } from "~/middleware/types";
import { CommandError } from "~/error";
import { RecordMap } from "~/types";

interface Context {
  username?: string;
  password?: string;
  account?: string;
  authenticated: boolean;
}

type ContextMap = RecordMap<Context>;

export interface CommandConnection extends Socket {
  context: ContextMap;
  use: (ware: MiddlewareDefinition) => void;
  send: (code: number, ...lines: string[]) => void;
}

export function getDefaultContext() {
  const context: RecordMap<Context> = new Map();
  context.set('authenticated', false);
  return context;
}

export const createCommandConnection = (socket: Socket) => {
  const connection = socket as CommandConnection;

  connection.context = getDefaultContext();

  // Observables

  const commandSubject = new Subject<Command>();
  fromEvent<Buffer>(connection, 'data')
    .pipe(
      takeUntil(fromEvent(connection, 'close')),
      map(parseBuffer),
      map(parseCommandString),
      tap((command) => console.log(`recv: ${command.raw.trim()}`))
    )
    .subscribe(commandSubject);

  const replySubject = new Subject();
  replySubject
    .pipe(
      takeUntil(fromEvent(connection, 'close')),
      map(([code, ...lines]) => formatReply(code, lines)),
      tap((message) => console.log(`send: ${message.trim()}`))
    )
    .subscribe((message) => connection.write(message));

  // Methods

  connection.use = (createMiddleware) => {
    const middleware = createMiddleware(connection);

    commandSubject.pipe(
      filter((command) => command.directive in middleware),
      switchMap(async (command) => {
        const context = getCommandContext(connection, command);
        await middleware[command.directive](context);
      })
    )
    .subscribe({
      error(err) {
        if (err instanceof CommandError) {
          this.send(err.code, err.message);
        } else {
          this.connection.emit('error', err);
        }
      }
    });
  };

  connection.send = (code: number, ...lines: string[]) => {
    replySubject.next([code, ...lines]);
  };

  return connection;
};

const parseBuffer = (buffer: Buffer) => buffer.toString('utf8');

export const createCommandObservable = (connection: CommandConnection) =>
  fromEvent<Buffer>(connection, 'data').pipe(
    takeUntil(fromEvent(connection, 'close')),
    map(parseBuffer),
    map(parseCommandString)
  );

export const resumeCommandConnection = (connection: CommandConnection) => {
  connection.resume();
};
