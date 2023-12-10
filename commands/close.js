const config = require('../config.json');

module.exports = {
    name: 'close',
    aliases: ['delete'],
    preventDefault: true,
    description: 'close the ticket',
    exec: async (args, input, message) => {
        const reason = input || 'no reason provided';
        await handlers.tickets.delete(message, reason);
        return;
    }
}