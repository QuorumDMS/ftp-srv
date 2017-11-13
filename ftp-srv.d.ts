import * as tls from 'tls'
import { Stats } from 'fs'

export class FileSystem {

	readonly connection: FtpConnection;
	readonly root: string;
	readonly cwd: string;

    constructor(connection: FtpConnection, {root, cwd}?: {
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

export class FtpConnection {
	server: FtpServer;
	id: string;
	log: any;
	transferType: string;
	encoding: string;
	bufferSize: boolean;
	readonly ip: string;
	restByteCount: number | undefined;
	secure: boolean

	close (code: number, message: number): Promise<any>
	login (username: string, password: string): Promise<any>
	reply (options: number | Object, ...letters: Array<any>): Promise<any>

}

export interface FtpServerOptions {
    pasv_range?: number | string,
    greeting?: string | string[],
    tls?: tls.SecureContext | false,
    anonymous?: boolean,
    blacklist?: Array<string>,
    whitelist?: Array<string>,
    file_format?: (stat: Stats) => string | Promise<string> | "ls" | "ep",
	log?: any
}

export class FtpServer {
    constructor(url: string, options?: FtpServerOptions);

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

	on(event: "login", listener: (
		data: {
			connection: FtpConnection,
			username: string,
			password: string
		},
		resolve: (config: {
            fs?: FileSystem,
            root?: string,
            cwd?: string,
            blacklist?: Array<string>,
            whitelist?: Array<string>
        }) => void,
		reject: (err?: Error) => void
	) => void)

	on(event: "client-error", listener: (
		data: {
			connection: FtpConnection,
			context: string,
			error: Error,
		}
	) => void)
}

export {FtpServer as FtpSrv};
export default FtpServer;
