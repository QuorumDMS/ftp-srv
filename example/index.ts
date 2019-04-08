import FTPServer from '../src/server';

const server = new FTPServer();
server.registerPlugin({
    command: 'PASS',
    handler: async ({connection, reply}) => {
        const username = connection.getContext('username');
        const password = connection.getContext('password');

        // AUTHENTICATE

        reply.set([230]);
    }
});
server.listen();