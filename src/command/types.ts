import { CommandConnection } from '~/connection/command';
import { OrPromise } from '../types';

export interface CommandContext {
  USER: {username: string};
  PASS: {password: string};
  ACCT: {account: string};
  CWD: void;
  CDUP: void;
  SMNT: void;
  REIN: void;
  QUIT: void;
  PORT: {ip: string, port: number};
  PASV: void;
  MODE: void;
  TYPE: void;
  STRU: void;
  ALLO: void;
  REST: void;
  STOR: void;
  STOU: void;
  RETR: void;
  LIST: void;
  NLST: void;
  APPE: void;
  RNFR: void;
  RNTO: void;
  DELE: void;
  RMD: void;
  MKD: void;
  PWD: void;
  ABOR: void;
  SYST: void;
  STAT: void;
  HELP: void;
  SITE: void;
  NOOP: void;
}

export type CommandDirective = keyof CommandContext;

export type Command = {
  directive: CommandDirective;
  arg: string | undefined,
  flags: string[],
  raw: string;
}

export type CommandDefinition<T extends CommandDirective> = (client: CommandConnection) => {
  /** Checks that command is valid, creates context for handle */
  setup?: (command: Command) => OrPromise<CommandContext[T]>;
  /** Performs actions required for command, can be extended with plugins */
  handle?: (context: CommandContext[T]) => OrPromise<void>;
}
