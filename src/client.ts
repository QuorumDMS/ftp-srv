// import { Socket } from 'net';

// import { fromEvent, Subject } from 'rxjs';
// import { map, tap, takeUntil } from 'rxjs/operators';

// import { parseCommandString, handleCommand } from '~/command';
// import { RecordMap } from './types';
// import { MiddlewareDefinition, MiddlewareCommandHandler } from './middleware/types';
// import { CommandDirective, Command } from './command/types';
// import { formatReply } from './reply';
// import { CommandError } from './error';

// export interface Context {
//   username?: string;
//   password?: string;
//   account?: string;
//   authenticated: boolean;
// }

// function getDefaultContext() {
//   const context: RecordMap<Context> = new Map();
//   context.set('authenticated', false);
//   return context;
// }

// function parseBuffer(buffer: Buffer): string {
//   return buffer.toString('utf8');
// }

// export default class FTPClient {
//   private middleware = new Set<MiddlewareDefinition>();
//   private commandMiddleware: RecordMap<{[T in CommandDirective]?: Set<MiddlewareCommandHandler<T>>}> = new Map();
//   private commandSubject: Subject<Command>;
//   private replySubject: Subject<[number, ...string[]]>;

//   public context = getDefaultContext();

//   public constructor(private connection: Socket) {
//     this.commandSubject = new Subject();

//     fromEvent<Buffer>(this.connection, 'data')
//       .pipe(
//         takeUntil(fromEvent(this.connection, 'close')),
//         map(parseBuffer),
//         map(parseCommandString),
//         tap((command) => console.log(`recv: ${command.raw.trim()}`))
//       )
//       .subscribe(this.commandSubject);

//     this.replySubject = new Subject();
//     this.replySubject
//       .pipe(
//         takeUntil(fromEvent(this.connection, 'close')),
//         map(([code, ...lines]) => formatReply(code, lines)),
//         tap((message) => console.log(`send: ${message.trim()}`))
//       )
//       .subscribe((message) => this.connection.write(message));
//   }

//   private initializeMiddleware() {
//     type Def = ReturnType<MiddlewareDefinition>;
//     type MiddlewareEntry = [ keyof Def, Def[keyof Def] ];

//     for (const createMiddleware of this.middleware.values()) {
//       const ware = createMiddleware(this);
//       for (const [command, handle] of Object.entries(ware) as MiddlewareEntry[]) {
//         const handles = this.commandMiddleware.get(command) ?? new Set<MiddlewareCommandHandler<typeof command>>();
//         handles.add(handle as MiddlewareCommandHandler<typeof command>);
//         this.commandMiddleware.set(command, handles);
//       }
//     }
//   }

//   public resetContext() {
//     this.context = getDefaultContext();
//   }

//   public use(ware: MiddlewareDefinition) {
//     this.middleware.add(ware);
//   }

//   public send(code: number, ...lines: string[]) {
//     this.replySubject.next([code, ...lines]);
//   }

//   public resume() {
//     this.initializeMiddleware();

//     this.commandSubject.subscribe(async (command) => {
//       try {
//         const wares = this.commandMiddleware.get(command.directive) ?? new Set();

//         await handleCommand(this, wares)(command);
//       } catch (err) {
//         if (err instanceof CommandError) {
//           this.send(err.code, err.message);
//         } else {
//           this.connection.emit('error', err);
//         }
//       }
//     });

//     this.connection.resume();
//   }

//   public close() {
//     this.connection.destroy();
//   }
// }

// export const createFTPClient = (socket: Socket) => {
//   return new FTPClient(socket);
// }
