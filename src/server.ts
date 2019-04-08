import { SecureContextOptions, createServer as createSecureServer } from 'tls';
import { Server, isIP, createServer, Socket } from 'net';

import Connection from './commandSocket';
import { Command, parseCommandBuffer, CommandRegistration, CommandReply, CommandHandler } from './command';

import { stru } from './command/stru';
import { user, pass, acct } from './command/authentication';
import { NodeFileSystem } from './filesystem';

interface FTPServerConfig {
    hostname: string;
    port: number;
}

interface PassiveConfig {
    hostname: string;
    port_min: number;
    port_max: number;
}

type EncryptionType = 'IMPLICIT'
| 'EXPLICIT';

interface EncryptionConfig {
    type: EncryptionType;
    context: SecureContextOptions;
}

export interface CommandPlugin {
    command: string;
    handler: CommandHandler;
    at?: 'before' | 'after';
}

export default class FTPServer {
    private instance?: Server;
    private config: FTPServerConfig;
    private passive?: PassiveConfig;
    private encryption?: EncryptionConfig;
    private fs?: NodeFileSystem;
    private commandHandlers: Map<string, CommandRegistration>;
    private plugins: Set<CommandPlugin>;

    constructor(config: Partial<FTPServerConfig> = {}) {
        this.config = {
            hostname: 'localhost',
            port: 21,
            ...config
        };

        this.plugins = new Set();
        this.commandHandlers = new Map([
            ['USER', user],
            ['PASS', pass],
            ['ACCT', acct],
            ['STRU', stru]
        ]);
    }

    public configureEncryption(type: EncryptionType, context: SecureContextOptions) {
        this.encryption = {
            type,
            context
        };
        return this;
    }

    public configurePassive(config: PassiveConfig) {
        this.passive = {
            port_min: 49152,
            port_max: 65535,
            ...config
        };

        if (isIP(this.passive.hostname) === 0) {
            // TODO: resolve url into ip using dns
            throw new Error('Passive hostname must be a valid IP address');
        }
        return this;
    }

    public configureFileSystem(fs: NodeFileSystem) {
        this.fs = fs;
        return this;
    }

    public registerPlugin(plugin: CommandPlugin) {
        if (!plugin.at) plugin.at = 'after';
        this.plugins.add(plugin);
    }

    /**
   * @returns `230` Login complete
   * @returns `331` Username okay, awaiting password
   * @returns `530` Login failed
   */
    public registerCommand(identifier: 'USER', registration: Partial<CommandRegistration>): this;
    public registerCommand(identifier: string, registration: Partial<CommandRegistration>) {
        identifier = identifier.toLocaleUpperCase();

        const existingHandler = this.commandHandlers.get(identifier);
        if (existingHandler) {
            registration = {
                ...existingHandler,
                ...registration
            };
        }

        if (!registration.handler) {
            throw new Error('Cannot register a command without a handler');
        }
        if (!registration.description) {
            throw new Error('Cannot register a command without a description');
        }

        this.commandHandlers.set(identifier, registration as CommandRegistration);
        return this;
    }

    public listen() {
        const connectionHandler = async (socket: Socket) => {
            const connection = new Connection(socket);

            socket.on('data', async (data) => {
                let command: Command;
                try {
                    command = parseCommandBuffer(data);
                } catch {
                    await connection.sendReply(500);
                    await connection.close();
                    return;
                }

                const registration = this.commandHandlers.get(command.identifier);
                if (!registration) {
                    await connection.sendReply(502);
                    return;
                }

                if (registration.arguments && registration.arguments.length > 0) {
                    if (!command.argument) {
                        await connection.sendReply(501);
                        return;
                    }
                }

                const plugins = [...this.plugins].filter((plug) => {
                    return plug.command === command.identifier;
                });
                const beforePlugins = plugins.filter((plug) => plug.at === 'before');
                const afterPlugins = plugins.filter((plug) => plug.at === 'after');

                try {
                    // Cache this?
                    const handles = [
                        ...beforePlugins.map((plug) => plug.handler),
                        registration.handler,
                        ...afterPlugins.map((plug) => plug.handler)
                    ];

                    const reply = (() => {
                        let value: CommandReply = [500];
                        return {
                            get: () => [...value] as CommandReply,
                            set: (v: CommandReply) => {
                                value = [...v] as CommandReply;
                            }
                        }
                    })();

                    for (const handle of handles) {
                        await handle({server: this, connection, command, reply});
                    }

                    const [replyCode, ...lines] = reply.get();
                    await connection.sendReply(replyCode, ...lines);
                } catch {
                    await connection.sendReply(500);
                }
            });

            socket.resume();
            await connection.sendReply(200);
        }

        const serverOptions = {pauseOnConnect: true};
        if (this.encryption && this.encryption.type === 'IMPLICIT') {
            this.instance = createSecureServer({...serverOptions, ...this.encryption.context}, connectionHandler);
        } else {
            this.instance = createServer(serverOptions, connectionHandler);
        }

        this.instance.once('listening', () => {});
        this.instance.once('close', () => {});
        this.instance.on('error', (err: Error) => {});

        this.instance.listen(this.config.port, this.config.hostname);
    }

    public async close() {

    }
}