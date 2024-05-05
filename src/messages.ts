/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export const DEFAULT_MESSAGE= {
  // 100 - 199 :: Remarks
  100: 'The requested action is being initiated',
  110: 'Restart marker reply',
  120: 'Service ready in %s minutes',
  125: 'Data connection already open; transfer starting',
  150: 'File status okay; about to open data connection',
  // 200 - 399 :: Acceptance
  /// 200 - 299 :: Positive Completion Replies
  /// These type of replies indicate that the requested action was taken and that the server is awaiting another command.
  200: 'The requested action has been successfully completed',
  202: 'Superfluous command',
  211: 'System status, or system help reply',
  212: 'Directory status',
  213: 'File status',
  214: 'Help message', // On how to use the server or the meaning of a particular non-standard command. This reply is useful only to the human user.
  215: 'UNIX Type: L8', // NAME system type. Where NAME is an official system name from the list in the Assigned Numbers document.
  220: 'Service ready for new user',
  221: 'Service closing control connection', // Logged out if appropriate.
  225: 'Data connection open; no transfer in progress',
  226: 'Closing data connection', // Requested file action successful (for example, file transfer or file abort).
  227: 'Entering Passive Mode', // (h1,h2,h3,h4,p1,p2).
  230: 'User logged in, proceed',
  234: 'Honored',
  250: 'Requested file action okay, completed',
  257: '\'%s\' created',
  /// 300 - 399 :: Positive Intermediate Replies
  /// These types of replies indicate that the requested action was taken and that the server is awaiting further information to complete the request.
  331: 'Username okay, awaiting password',
  332: 'Need account for login',
  350: 'Requested file action pending further information',
  // 400 - 599 :: Rejection
  /// 400 - 499 :: Transient Negative Completion Replies
  /// These types of replies indicate that the command was not accepted; the requested action was not taken.
  /// However, the error is temporary and the action may be requested again.
  421: 'Service not available, closing control connection', // This may be a reply to any command if the service knows it must shut down.
  425: 'Unable to open data connection',
  426: 'Connection closed; transfer aborted',
  450: 'Requested file action not taken', // File unavailable (e.g., file busy).
  451: 'Requested action aborted. Local error in processing',
  452: 'Requested action not taken. Insufficient storage',
  /// 500 - 599 :: Permanent Negative Completion Replies
  /// These types of replies indicate that the command was not accepted; the requested action was not taken.
  /// The FTP client is "discouraged" from repeating the same exact request.
  500: 'Syntax error', // Can close connection
  501: 'Syntax error in parameters or arguments',
  502: 'Command not supported',
  503: 'Bad sequence of commands',
  504: 'Command parameter not supported',
  530: 'Not logged in', // Permission Denied, Can close connection
  532: 'Need account for storing files',
  550: 'Requested action not taken. File unavailable', // (e.g., file not found, no access).
  551: 'Requested action aborted. Page type unknown',
  552: 'Requested file action aborted. Exceeded storage allocation', // (for current directory or dataset).
  553: 'Requested action not taken. File name not allowed'
};
