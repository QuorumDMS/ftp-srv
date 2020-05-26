export interface Reply {
  code: number;
  message?: string;
}

/*
110 Restart marker reply.
    In this case, the text is exact and not left to the
    particular implementation; it must read:
        MARK yyyy = mmmm
    Where yyyy is User-process data stream marker, and mmmm
    server's equivalent marker (note the spaces between markers
    and "=").
120 Service ready in nnn minutes.
125 Data connection already open; transfer starting.
150 File status okay; about to open data connection.
200 Command okay.
202 Command not implemented, superfluous at this site.
211 System status, or system help reply.
212 Directory status.
213 File status.
214 Help message.
    On how to use the server or the meaning of a particular
    non-standard command.  This reply is useful only to the
    human user.
215 NAME system type.
    Where NAME is an official system name from the list in the
    Assigned Numbers document.
220 Service ready for new user.
221 Service closing control connection.
    Logged out if appropriate.
225 Data connection open; no transfer in progress.
226 Closing data connection.
    Requested file action successful (for example, file
    transfer or file abort).
227 Entering Passive Mode (h1,h2,h3,h4,p1,p2).
230 User logged in, proceed.
250 Requested file action okay, completed.
257 "PATHNAME" created.

331 User name okay, need password.
332 Need account for login.
350 Requested file action pending further information.

421 Service not available, closing control connection.
    This may be a reply to any command if the service knows it
    must shut down.
425 Can't open data connection.
426 Connection closed; transfer aborted.
450 Requested file action not taken.
    File unavailable (e.g., file busy).
451 Requested action aborted: local error in processing.
452 Requested action not taken.
    Insufficient storage space in system.
500 Syntax error, command unrecognized.
    This may include errors such as command line too long.
501 Syntax error in parameters or arguments.
502 Command not implemented.
503 Bad sequence of commands.
504 Command not implemented for that parameter.
530 Not logged in.
532 Need account for storing files.
550 Requested action not taken.
    File unavailable (e.g., file not found, no access).
551 Requested action aborted: page type unknown.
552 Requested file action aborted.
    Exceeded storage allocation (for current directory or
    dataset).
553 Requested action not taken.
    File name not allowed.
*/
