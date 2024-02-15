const config = require('../config.json');
const { dbs } = require('../ticketomancy.js');
// work in progress
module.exports = {
    name: 'unclaim',
    aliases: ['unlock'],
    description: 'unclaim the ticket',
    exec: async (input, message) => {
        const ticket = await dbs.t.findOne({ channel: message.channel.id });

        if (!ticket) throw new InputError('This channel is not a ticket!');
        if (!ticket.claimed) throw new PermissionsError('This ticket is not claimed!');
        if (!config.tickets.categories[ticket.type].team.map(r => message.member.roles.cache.has(r)).includes(true)) throw new PermissionsError('You can\'t unclaim this ticket!');
        
        await dbs.t.updateOne({ _id: ticket._id }, { $unset: { claimed: 1 } }, { upsert: true });
        message.channel.edit({ 
            name: message.channel.name.substring(8), // c1 l2 a3 i4 m5 e6 d7 -8
            topic: null
        }).catch(() => message.reply('Failed to rename channel, skipping.'));

        for (const t of config.tickets.categories[ticket.type].team) await message.channel.permissionOverwrites.edit(t, { SendMessages: true });
        await message.channel.permissionOverwrites.delete(message.author.id);

        return `<@${message.author.id}> Successfully unclaimed ticket.`
    }
}