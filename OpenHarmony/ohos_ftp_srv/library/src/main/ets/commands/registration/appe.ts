import { stor } from "./stor";

export const appe = {
    directive: 'APPE',
    handler: function (args) {
        return stor.handler.call(this, args);
    },
    syntax: '{{cmd}} <path>',
    description: 'Append to a file'
};
