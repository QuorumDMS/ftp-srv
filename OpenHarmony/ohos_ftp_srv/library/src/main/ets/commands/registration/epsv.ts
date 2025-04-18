import { Passive } from "../../connector/passive";

export const epsv = {
  directive: 'EPSV',
  handler: function (data) {
    this.connector = new Passive(this);
    return this.connector.setupServer()
      .then((data) => {
        const port = data;
        return this.reply(229, `EPSV OK (|||${port}|)`);
      })
      .catch((err) => {
        data.log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}} [<protocol>]',
  description: 'Initiate passive mode'
};
