import { cwd } from "./cwd";

export const cdup = {
  directive: ['CDUP', 'XCUP'],
  handler: function (args) {
    args.command.arg = '..';
    return cwd.handler.call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Change to Parent Directory'
};
