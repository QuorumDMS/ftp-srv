import { list } from "./list";

export const nlst = {
  directive: 'NLST',
  handler: function (args) {
    return list.handler.call(this, args);
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns a list of file names in a specified directory'
};
