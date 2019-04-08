import { Socket } from "net";
import { ReplyCode, formatReply } from "./reply";
import { FileSystem } from "./filesystem";

interface Meta {
    connectedTime: string;
    disconnectedTime?: string;
    address?: string;
}

interface Context {
    username?: string;
    password?: string;
    account?: string;
}

export default class CommandSocket {
    private instance: Socket;
    private meta: Meta;
    private context: Context = {};
    private filesystem: FileSystem;

    constructor(socket: Socket) {
        this.instance = socket.setEncoding('utf8');
        this.meta = {
            address: this.instance.remoteAddress,
            connectedTime: new Date().toUTCString()
        };
        this.filesystem = new FileSystem();
    };

    public async sendReply(code: ReplyCode, ...lines: string[]) {
        const reply = formatReply(code, ...lines);
        await new Promise((resolve, reject) => {
            this.instance.write(Buffer.from(reply), 'utf8', (err: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    public async close() {

    }

    public hasContext<K extends keyof Context>(...names: K[]): boolean {
        for (const name of names) {
            if (!this.context.hasOwnProperty(name)) return false;
        }
        return true;
    }

    public getContext<K extends keyof Context>(name: K): Context[K] {
        return this.context[name];
    }

    public setContext<K extends keyof Context>(name: K, value: Context[K]): this {
        this.context[name] = value;
        return this;
    }

    public unsetContext<K extends keyof Context>(...names: K[]): this {
        for (const name of names) {
            delete this.context[name];
        }
        return this;
    }

    public unsetAllContext() {
        this.context = {};
        return this;
    }
}
