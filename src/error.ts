export class CommandError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export class UnsupportedCommandError extends CommandError {
  constructor(public directive: string) {
    super(502, `Command not implemented: ${directive}`);
  }
}

export class SkipCommandError extends CommandError {
  constructor(code: number, message?: string) {
    super(code, message);
  }
}
