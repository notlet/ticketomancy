const config = require('../config.json');

module.exports = {
    name: 'close',
    aliases: ['delete'],
    preventDefault: true,
    description: 'close the ticket',
    exec: async (args, input, message) => {
        const reason = input || 'no reason provided';

        const ticket = await dbs.t.findOne({ channel: message.channel.id });
        if (!ticket) throw new InputError('This channel is not a ticket!');
        if ((config.tickets.categories[ticket.type].allowClose ? config.tickets.categories[ticket.type].allowClose !== true : config.tickets.defaults?.allowClose !== true) && !config.tickets.categories[ticket.type].team.map(r => message.member.roles.cache.has(r)).includes(true)) return message.channel.send({ content: `<@${message.author.id}> has requested to close this ticket!`, allowedMentions: { parse: [] } });

        await handlers.tickets.delete(message.channel, reason, message.member);
        return;
    }
}