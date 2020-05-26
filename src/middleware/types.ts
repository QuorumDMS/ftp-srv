import {CommandConnection} from "~/connection/command";
import { CommandDirective, CommandContext } from "~/command/types";
import { OrPromise } from "~/types";

export type MiddlewareCommandHandler<T extends CommandDirective> = (context: CommandContext[T]) => OrPromise<void>;

export type MiddlewareDefinition = (connection: CommandConnection) => {
  [T in CommandDirective]?: MiddlewareCommandHandler<T>;
}
