import { dele } from "./dele";

export const rmd = {
  directive: ['RMD', 'XRMD'],
  handler: function (args) {
    return dele.handler.call(this, args);
  },
  syntax: '{{cmd}} <path>',
  description: 'Remove a directory'
};
