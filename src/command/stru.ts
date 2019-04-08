import { CommandRegistration } from ".";

const stru: CommandRegistration = {
    arguments: ['<structure>'],
    description: 'Set file transfer structure (Only "F" supported)',
    handler: async ({command, reply}) => {
        const code = /^F$/i.test(command.argument) ? 200 : 504;
        reply.set([code]);
    }
}
export {stru};