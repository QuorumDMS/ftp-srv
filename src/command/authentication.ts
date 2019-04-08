import { CommandRegistration } from ".";

const user: CommandRegistration = {
    arguments: ['username'],
    description: 'Set the username to authenticate with',
    handler: async function ({connection, command, reply}) {
        if (connection.hasContext('username')) {
            /*
        RFC 959
        4.1.1.
        Servers may allow a new USER command to be
        entered at any point in order to change the access control
        and/or accounting information.  This has the effect of
        flushing any user, password, and account information already
        supplied and beginning the login sequence again.  All
        transfer parameters are unchanged and any file transfer in
        progress is completed under the old access control
        parameters.
      */
            connection.unsetContext('username', 'password');
        }

        connection.setContext('username', command.argument);

        reply.set([331]);
    }
};

const pass: CommandRegistration = {
    arguments: ['password'],
    description: 'Set the password to authenticate with',
    handler: async function ({connection, command, reply}) {
        if (connection.hasContext('password')) {
            reply.set([202]);
            return;
        }

        if (!connection.hasContext('username')) {
            reply.set([503]);
            return;
        }

        connection.setContext('password', command.argument);
        reply.set([230]);
    }
};

const acct: CommandRegistration = {
    arguments: ['account-information'],
    description: 'Set the identifying account',
    handler: async function ({connection, command, reply}) {
        if (!connection.hasContext('username', 'password')) {
            reply.set([503]);
        }

        connection.setContext('account', command.argument);
        reply.set([230]);
    }
};

export {
    user,
    pass,
    acct
};