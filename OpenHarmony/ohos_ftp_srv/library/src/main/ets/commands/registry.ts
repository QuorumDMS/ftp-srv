/* eslint no-return-assign: 0 */
import { abor } from './registration/abor';
import { allo } from './registration/allo';
import { appe } from './registration/appe';
import { auth } from './registration/auth';
import { cdup } from './registration/cdup';
import { cwd } from './registration/cwd';
import { dele } from './registration/dele';
import { feat } from './registration/feat';
import { help } from './registration/help';
import { list } from './registration/list';
import { mdtm } from './registration/mdtm';
import { mkd } from './registration/mkd';
import { mode } from './registration/mode';
import { nlst } from './registration/nlst';
import { noop } from './registration/noop';
import { opts } from './registration/opts';
import { pass } from './registration/pass';
import { pasv } from './registration/pasv';
import { port } from './registration/port';
import { pwd } from './registration/pwd';
import { quit } from './registration/quit';
import { rest } from './registration/rest';
import { retr } from './registration/retr';
import { rmd } from './registration/rmd';
import { rnfr } from './registration/rnfr';
import { rnto } from './registration/rnto';
import { site } from './registration/site';
import { size } from './registration/size';
import { stat } from './registration/stat';
import { stor } from './registration/stor';
import { stou } from './registration/stou';
import { stru } from './registration/stru';
import { syst } from './registration/syst';
import { type } from './registration/type';
import { user } from './registration/user';
import { pbsz } from './registration/pbsz';
import { prot } from './registration/prot';
import { eprt } from './registration/eprt';
import { epsv } from './registration/epsv';

const commands = [
  abor,
  allo,
  appe,
  auth,
  cdup,
  cwd,
  dele,
  feat,
  help,
  list,
  mdtm,
  mkd,
  mode,
  nlst,
  noop,
  opts,
  pass,
  pasv,
  port,
  pwd,
  quit,
  rest,
  retr,
  rmd,
  rnfr,
  rnto,
  site,
  size,
  stou,
  stat,
  stor,
  syst,
  type,
  stru,
  user,
  pbsz,
  prot,
  eprt,
  epsv,
];


export const registry = commands.reduce((result, cmd) => {
  const aliases = Array.isArray(cmd.directive) ? cmd.directive : [cmd.directive];
  aliases.forEach((alias) => result[alias] = cmd);
  return result;
}, {});


