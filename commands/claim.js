const { dbs } = require('../ticketomancy.js');
const RateLimit = require('../ratelimit.js');

const ratelimit = new RateLimit({ minutes: 10, threshold: 2 });

module.exports = {
    name: 'claim',
    aliases: ['lock'],
    description: 'claim the ticket',
    ratelimit,
    exec: async (input, message) => {
        const ticket = await dbs.t.findOne({ channel: message.channel.id });

        if (!ticket) throw new InputError('This channel is not a ticket!');
        if (ticket.claimed) throw new PermissionsError('This ticket is already claimed!');
        if (!config.categories[ticket.type].team.map(r => message.member.roles.cache.has(r)).includes(true)) throw new PermissionsError('You can\'t claim this ticket!');
        
        await dbs.t.updateOne({ _id: ticket._id }, { $set: { claimed: message.author.id } }, { upsert: true });

        if (ratelimit.check('rename')) message.channel.edit({ 
            name: `claimed-${message.channel.name}`,
            topic: `Claimed by <@${message.author.id}>`
        }).catch(() => message.channel.send('Failed to rename channel, skipping.'));
        else await message.channel.send('Too many renames, skipping.');

        await message.channel.permissionOverwrites.edit(message.author.id, { SendMessages: true });
        for (const t of config.categories[ticket.type].team) await message.channel.permissionOverwrites.edit(t, { SendMessages: false });

        return `<@${message.author.id}> Successfully claimed ticket. Use \`${config.prefix}unclaim\` to unclaim.`
    }
}