module.exports = {
  AUTH: {
    handler: require('./auth'),
    syntax: 'AUTH [type]',
    help: 'Not supported',
    no_auth: true
  },
  USER: {
    handler: require('./user'),
    syntax: 'USER [username]',
    help: 'Authentication username',
    no_auth: true
  },
  PASS: {
    handler: require('./pass'),
    syntax: 'PASS [password]',
    help: 'Authentication password',
    no_auth: true
  },
  SYST: {
    handler: require('./syst'),
    syntax: 'SYST',
    help: 'Return system type',
    no_auth: true
  },
  FEAT: {
    handler: require('./feat'),
    syntax: 'FEAT',
    help: 'Get the feature list implemented by the server',
    no_auth: true
  },
  PWD:  {
    handler: require('./pwd'),
    syntax: 'PWD',
    help: 'Print current working directory'
  },
  XPWD: {
    handler: require('./pwd'),
    syntax: 'XPWD',
    help: 'Print current working directory'
  },
  TYPE: {
    handler: require('./type'),
    syntax: 'TYPE',
    help: 'Set the transfer mode'
  },
  PASV: {
    handler: require('./pasv'),
    syntax: 'PASV',
    help: 'Initiate passive mode'
  },
  PORT: {
    handler: require('./port'),
    syntax: 'PORT [x,x,x,x,y,y]',
    help: 'Specifies an address and port to which the server should connect'
  },
  LIST: {
    handler: require('./list'),
    syntax: 'LIST [path(optional)]',
    help: 'Returns information of a file or directory if specified, else information of the current working directory is returned'
  },
  NLST: {
    handler: require('./list'),
    syntax: 'NLST [path(optional)]',
    help: 'Returns a list of file names in a specified directory'
  },
  CWD:  {
    handler: require('./cwd'),
    syntax: 'CWD [path]',
    help: 'Change working directory'
  },
  XCWD: {
    handler: require('./cwd'),
    syntax: 'XCWD [path]',
    help: 'Change working directory'
  },
  CDUP: {
    handler: require('./cdup'),
    syntax: 'CDUP',
    help: 'Change to Parent Directory'
  },
  XCUP: {
    handler: require('./cdup'),
    syntax: 'XCUP',
    help: 'Change to Parent Directory'
  },
  STOR: {
    handler: require('./stor'),
    syntax: 'STOR [path]',
    help: 'Accept the data and to store the data as a file at the server site'
  },
  APPE: {
    handler: require('./stor'),
    syntax: 'APPE [path]',
    help: 'Append to file'
  },
  RETR: {
    handler: require('./retr'),
    syntax: 'RETR [path]',
    help: 'Retrieve a copy of the file'
  },
  DELE: {
    handler: require('./dele'),
    syntax: 'DELE [path]',
    help: 'Delete file'
  },
  RMD: {
    handler: require('./dele'),
    syntax: 'RMD [path]',
    help: 'Remove a directory'
  },
  XRMD: {
    handler: require('./dele'),
    syntax: 'XRMD [path]',
    help: 'Remove a directory'
  },
  HELP: {
    handler: require('./help'),
    syntax: 'HELP [command(optional)]',
    help: 'Returns usage documentation on a command if specified, else a general help document is returned'
  },
  MDTM: {
    handler: require('./mdtm'),
    syntax: 'MDTM [path]',
    help: 'Return the last-modified time of a specified file',
    feat: 'MDTM'
  },
  MKD:  {
    handler: require('./mkd'),
    syntax: 'MKD [path]',
    help: 'Make directory'
  },
  XMKD: {
    handler: require('./mkd'),
    syntax: 'XMKD [path]',
    help: 'Make directory'
  },
  NOOP: {
    handler: require('./noop'),
    syntax: 'NOOP',
    help: 'No operation',
    no_auth: true
  },
  QUIT: {
    handler: require('./quit'),
    syntax: 'QUIT',
    help: 'Disconnect',
    no_auth: true
  },
  RNFR: {
    handler: require('./rnfr'),
    syntax: 'RNFR [name]',
    help: 'Rename from'
  },
  RNTO: {
    handler: require('./rnto'),
    syntax: 'RNTO [name]',
    help: 'Rename to'
  },
  SIZE: {
    handler: require('./size'),
    syntax: 'SIZE [path]',
    help: 'Return the size of a file',
    feat: 'SIZE'
  },
  STAT: {
    handler: require('./stat'),
    syntax: 'SIZE [path(optional)]',
    help: 'Returns the current status'
  },
  SITE: {
    handler: require('./site'),
    syntax: 'SITE [subVerb] [subParams]',
    help: 'Sends site specific commands to remote server'
  },
  OPTS: {
    handler: require('./opts'),
    syntax: 'OPTS',
    help: 'Select options for a feature'
  },

  STRU: {
    handler: require('./stru'),
    syntax: 'STRU [structure]',
    help: 'Set file transfer structure',
    obsolete: true
  },
  ALLO: {
    handler: require('./allo'),
    syntax: 'ALLO',
    help: 'Allocate sufficient disk space to receive a file',
    obsolete: true
  },
  MODE: {
    handler: require('./mode'),
    syntax: 'MODE [mode]',
    help: 'Sets the transfer mode (Stream, Block, or Compressed)',
    obsolete: true
  }
};
