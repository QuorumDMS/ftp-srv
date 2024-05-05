/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//@ts-ignore
import { get, clone, chain, includes, upperCase } from "lodash";
import { registry } from "./registry";

const CMD_FLAG_REGEX = new RegExp(/^-(\w{1})$/);

export class FtpCommands {
  connection;
  previousCommand;
  blacklist;
  whitelist;

  constructor(connection) {
    this.connection = connection;
    this.previousCommand = {};
    this.blacklist = get(this.connection, 'server.options.blacklist', []).map((cmd) => upperCase(cmd));
    this.whitelist = get(this.connection, 'server.options.whitelist', []).map((cmd) => upperCase(cmd));
  }

  parse(message) {
    const strippedMessage = message.replace(/"/g, '');
    let [directive, ...args] = strippedMessage.split(' ');
    directive = chain(directive).trim().toUpper().value();

    const parseCommandFlags = !['RETR', 'SIZE', 'STOR'].includes(directive);
    const params = args.reduce(({arg, flags}, param) => {
      if (parseCommandFlags && CMD_FLAG_REGEX.test(param)) flags.push(param);
      else arg.push(param);
      return { arg, flags };
    }, { arg: [], flags: [] });

    const command = {
      directive,
      arg: params.arg.length ? params.arg.join(' ') : null,
      flags: params.flags,
      raw: message
    };
    return command;
  }

  handle(command) {
    if (typeof command === 'string') command = this.parse(command);

    // Obfuscate password from logs
    const logCommand = clone(command);
    if (logCommand.directive === 'PASS') logCommand.arg = '********';

    const log = this.connection.log
    log.info({ directive: command.directive });
    log.trace({ command: logCommand }, 'Handle command');

    if (!registry.hasOwnProperty(command.directive)) {
      return this.connection.reply(502, `Command not allowed: ${command.directive}`);
    }

    if (includes(this.blacklist, command.directive)) {
      return this.connection.reply(502, `Command blacklisted: ${command.directive}`);
    }

    if (this.whitelist.length > 0 && !includes(this.whitelist, command.directive)) {
      return this.connection.reply(502, `Command not whitelisted: ${command.directive}`);
    }

    const commandRegister = registry[command.directive];
    const commandFlags = get(commandRegister, 'flags', {});
    if (!commandFlags.no_auth && !this.connection.authenticated) {
      return this.connection.reply(530, `Command requires authentication: ${command.directive}`);
    }

    if (!commandRegister.handler) {
      return this.connection.reply(502, `Handler not set on command: ${command.directive}`);
    }

    const handler = commandRegister.handler.bind(this.connection);
    return Promise.resolve(handler({ log, command, previous_command: this.previousCommand }))
      .then(() => {
        this.previousCommand = clone(command);
      });
  }
}


