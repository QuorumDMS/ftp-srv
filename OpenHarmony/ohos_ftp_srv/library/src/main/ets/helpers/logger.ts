export class Logger {
  private readonly name: string;
  private readonly level: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  private isDebug: boolean = false;

  constructor(name: string, level: 'trace' | 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.name = name;
    this.level = level;
  }

  private log(level: string, messageOrObject: string | object, ...args: any[]) {
    if (this.isDebug && this.level <= level) {
      let formattedMessage;
      if (typeof messageOrObject === 'string') {
        formattedMessage = messageOrObject;
      } else {
        formattedMessage = JSON.stringify(messageOrObject);
      }
      const fullMessage = `[${this.name}] ${level.toUpperCase()}: ${formattedMessage}`
      console[level](fullMessage, ...args);
    }
  }

  trace(messageOrObject: string | object, ...args: any[]) {
    this.log('trace', messageOrObject, ...args);
  }

  debug(messageOrObject: string | object, ...args: any[]) {
    this.log('debug', messageOrObject, ...args);
  }

  info(messageOrObject: string | object, ...args: any[]) {
    this.log('info', messageOrObject, ...args);
  }

  warn(messageOrObject: string | object, ...args: any[]) {
    this.log('warn', messageOrObject, ...args);
  }

  error(messageOrObject: string | object, ...args: any[]) {
    this.log('error', messageOrObject, ...args);
  }
}