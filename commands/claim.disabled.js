const config = require('../config.json');
const { dbs } = require('../ticketomancy.js');
// work in progress
module.exports = {
    name: 'claim',
    aliases: ['lock'],
    description: 'claim the ticket',
    exec: async (input, message) => {
        const ticket = await dbs.t.findOne({ channel: message.channel.id });

        if (!ticket) throw new InputError('This channel is not a ticket!');
        if (ticket.claimed) throw new PermissionsError('This ticket is already claimed!');
        if (!config.tickets.categories[ticket.type].team.map(r => message.member.roles.cache.has(r)).includes(true)) throw new PermissionsError('You can\'t claim this ticket!');
        
        await dbs.t.updateOne({ _id: ticket._id }, { $set: { claimed: message.author.id } }, { upsert: true });
        message.channel.edit({ 
            name: `claimed-${message.channel.name}`,
            topic: `Claimed by <@${message.author.id}>`
        }).catch(() => message.reply('Failed to rename channel, skipping.'));

        await message.channel.permissionOverwrites.edit(message.author.id, { SendMessages: true });
        for (const t of config.tickets.categories[ticket.type].team) await message.channel.permissionOverwrites.edit(t, { SendMessages: false });

        return `<@${message.author.id}> Successfully claimed ticket. Use \`${config.prefix}unclaim\` to unclaim.`
    }
}