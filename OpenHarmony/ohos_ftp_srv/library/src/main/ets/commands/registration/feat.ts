//@ts-ignore
import { concat, get } from "lodash";
import { registry } from "../registry";

export const feat = {
  directive: 'FEAT',
  handler: function () {
    const features = Object.keys(registry)
      .reduce((feats, cmd) => {
        const feat = get(registry[cmd], 'flags.feat', null);
        if (feat) return concat(feats, feat);
        return feats;
      }, ['UTF8'])
      .sort()
      .map((feat) => ({
        message: ` ${feat}`,
        raw: true
      }));
    return features.length
      ? this.reply(211, 'Extensions supported', ...features, 'End')
      : this.reply(211, 'No features');
  },
  syntax: '{{cmd}}',
  description: 'Get the feature list implemented by the server',
  flags: {
    no_auth: true
  }
};
