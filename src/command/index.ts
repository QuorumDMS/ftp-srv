import CommandSocket from "../commandSocket";
import FTPServer from "../server";
import { ReplyCode } from "../reply";

export interface Command {
    identifier: string;
    argument: string;
    argumentParts: string[];
}

export type CommandReply = [ReplyCode, ...string[]];

export interface CommandReplyMod {
    get: () => CommandReply;
    set: (v: CommandReply) => void;
}
export type CommandHandler = (params: {server: Readonly<FTPServer>; connection: Readonly<CommandSocket>; command: Command; reply: CommandReplyMod}) => Promise<void>;

export interface CommandRegistration {
    arguments?: string[];
    description: string;
    handler: CommandHandler;
}

export function parseCommandBuffer(data: Buffer): Command {
    const result = data
        .toString('utf8')
        .replace(/\s+/g, ' ')
        .match(/^(\w+?)(?: (.+)$|$)/);

    if (!result) throw new Error('Invalid command');

    const identifier = result[1].toLocaleUpperCase();
    const argument = result.length > 1 ? result[2].trim() : '';
    const argumentParts = argument.split(' ');

    return {
        identifier,
        argument,
        argumentParts
    };
}
