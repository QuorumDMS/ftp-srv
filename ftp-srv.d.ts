declare class FileSystem {
    constructor(connection: any, {root, cwd}?: {
        root: any;
        cwd: any;
    });

    currentDirectory(): string;

    get(fileName: string): Promise<any>;

    list(path?: string): Promise<any>;

    chdir(path?: string): Promise<string>;

    write(fileName: string, {append, start}?: {
        append?: boolean;
        start?: any;
    }): any;

    read(fileName: string, {start}?: {
        start?: any;
    }): Promise<any>;

    delete(path: string): Promise<any>;

    mkdir(path: string): Promise<any>;

    rename(from: string, to: string): Promise<any>;

    chmod(path: string, mode: string): Promise<any>;

    getUniqueName(): string;
}

declare class FtpServer {
    constructor(url: string, options?: {});

    readonly isTLS: boolean;

    listen(): any;

    emitPromise(action: any, ...data: any[]): Promise<any>;

    emit(action: any, ...data: any[]): void;

    setupTLS(_tls: boolean): boolean | {
      cert: string;
      key: string;
      ca: string
    };

    setupGreeting(greet: string): string[];

    setupFeaturesMessage(): string;

    disconnectClient(id: string): Promise<any>;

    close(): any;
}

declare const FtpSrv: FtpServer;
export default FtpServer;
