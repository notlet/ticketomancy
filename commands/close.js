const { dbs } = require('../ticketomancy.js');

module.exports = {
    name: 'close',
    aliases: ['delete'],
    description: 'close the ticket',
    exec: async (input, message) => {
        const reason = input || 'no reason provided';

        const ticket = await dbs.t.findOne({ channel: message.channel.id });
        if (!ticket) throw new InputError('This channel is not a ticket!');
        if ((config.categories[ticket.type].allowClose ? config.categories[ticket.type].allowClose !== true : config.defaults?.allowClose !== true) && !config.categories[ticket.type].team.map(r => message.member.roles.cache.has(r)).includes(true)) return message.channel.send({ content: `<@${message.author.id}> has requested to close this ticket!`, allowedMentions: { parse: [] } });

        await handlers.tickets.delete(message.channel, reason, message.member);
        return;
    }
}