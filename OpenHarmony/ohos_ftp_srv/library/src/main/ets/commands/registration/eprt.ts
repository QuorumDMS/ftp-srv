//@ts-ignore
import { chain } from "lodash";
import { Active } from "../../connector/active";

const FAMILY = {
  1: 4,
  2: 6
};

export const eprt = {
  directive: 'EPRT',
  handler: function (data) {
    const [, protocol, ip, port] = chain(data.command).get('arg', '').split('|').value();
    const family = FAMILY[protocol];
    if (!family) return this.reply(504, 'Unknown network protocol');

    this.connector = new Active(this);
    return this.connector.setupConnection(ip, port, family)
      .then(() => this.reply(200))
      .catch((err) => {
        data.log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}} |<protocol>|<address>|<port>|',
  description: 'Specifies an address and port to which the server should connect'
};
