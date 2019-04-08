/**
 * https://tools.ietf.org/html/rfc2228
 * https://tools.ietf.org/html/rfc4217
 */

import { CommandRegistration } from ".";

/*
  AUTHENTICATION/SECURITY MECHANISM (AUTH)

  The argument field is a Telnet string identifying a supported
  mechanism.  This string is case-insensitive.  Values must be
  registered with the IANA, except that values beginning with "X-"
  are reserved for local use.

  If the server does not recognize the AUTH command, it must respond
  with reply code 500.  This is intended to encompass the large
  deployed base of non-security-aware ftp servers, which will
  respond with reply code 500 to any unrecognized command.  If the
  server does recognize the AUTH command but does not implement the
  security extensions, it should respond with reply code 502.

  If the server does not understand the named security mechanism, it
  should respond with reply code 504.

  If the server is not willing to accept the named security
  mechanism, it should respond with reply code 534.

  If the server is not able to accept the named security mechanism,
  such as if a required resource is unavailable, it should respond
  with reply code 431.

  If the server is willing to accept the named security mechanism,
  but requires security data, it must respond with reply code 334.

  If the server is willing to accept the named security mechanism,
  and does not require any security data, it must respond with reply
  code 234.

  If the server is responding with a 334 reply code, it may include
  security data as described in the next section.

  Some servers will allow the AUTH command to be reissued in order
  to establish new authentication.  The AUTH command, if accepted,
  removes any state associated with prior FTP Security commands.
  The server must also require that the user reauthorize (that is,
  reissue some or all of the USER, PASS, and ACCT commands) in this
  case (see section 4 for an explanation of "authorize" in this
  context).

  AUTH
    234
    334
    502, 504, 534, 431
    500, 501, 421
*/
const auth: CommandRegistration = {
    arguments: ['<mechanism-name>'],
    description: 'Set authentication mechanism',
    handler: async ({command, reply}) => {
        const method = command.argument.toLocaleUpperCase();



        switch (method) {
            default: reply.set([504]);
        }
    }
}

/*
  PROTECTION BUFFER SIZE (PBSZ)

  The argument is a decimal integer representing the maximum size,
  in bytes, of the encoded data blocks to be sent or received during
  file transfer.  This number shall be no greater than can be
  represented in a 32-bit unsigned integer.

  This command allows the FTP client and server to negotiate a
  maximum protected buffer size for the connection.  There is no
  default size; the client must issue a PBSZ command before it can
  issue the first PROT command.

  The PBSZ command must be preceded by a successful security data
  exchange.

  If the server cannot parse the argument, or if it will not fit in
  32 bits, it should respond with a 501 reply code.

  If the server has not completed a security data exchange with the
  client, it should respond with a 503 reply code.

  Otherwise, the server must reply with a 200 reply code.  If the
  size provided by the client is too large for the server, it must
  use a string of the form "PBSZ=number" in the text part of the
  reply to indicate a smaller buffer size.  The client and the
  server must use the smaller of the two buffer sizes if both buffer
  sizes are specified.

  PBSZ
    200
    503
    500, 501, 421, 530
*/
const pbsz: CommandRegistration = {
    arguments: ['<decimal-integer>'],
    description: 'The maximum size, in bytes, of the encoded data blocks to be sent or received during file transfer.',
    handler: async ({reply}) => {
        reply.set([500]);
    }
}

/*
  PROT
    200
    504, 536, 503, 534, 431
    500, 501, 421, 530
*/
const prot: CommandRegistration = {
    arguments: ['<prot-code ::= C | S | E | P>'],
    description: 'Indicates to the server what type of data channel protection the client and server will be using',
    handler: async ({reply}) => {
        reply.set([536]);
    }
}

export {
    auth,
    pbsz,
    prot
};
