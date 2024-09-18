const fs = require('fs');
const { dbs } = require('../../ticketomancy.js');

module.exports = async i => {
    if (i.customId.startsWith('open_')) {
        const type = i.customId.split('_')[1];
        if (!Object.keys(config.categories).includes(type)) return i.reply({ content: `${config.emojis.blacklisted} Invalid ticket type, please contact the bot administrator!${config.owner ? ' (<@' + config.owner + '>)' : ''}`, ephemeral: true });
        if ([...(config.defaults?.blacklist || []), ...(config.categories[type].blacklist || [])].map(r => i.member.roles.cache.has(r)).includes(true)) return await i.reply({ content: `${config.emojis.blacklisted} You cannot create a ticket in this category!`, ephemeral: true });

        const openedAmount = await dbs.t.countDocuments({ user: i.user.id, type });
        const openedLimit = config.categories[type].limit || config.defaults?.limit || 0;
        if (openedLimit !== 0 && openedAmount >= openedLimit) return await i.reply({ content: `${config.emojis.blacklisted} You can only open ${openedLimit} ticket${openedLimit !== 1 ? 's' : ''} in this category!`, ephemeral: true });

        if (config.categories[type].modal) return i.showModal(config.categories[type].modal);

        await i.reply({ content: `${config.emojis.loading} Please wait, opening ticket...`, ephemeral: true });

        handlers.tickets.create(i.user, type)
            .then(newchannel => i.editReply({ content: `${config.emojis.created} Ticket created in <#${newchannel.id}>!`, ephemeral: true }))
            .catch(e => {
                console.error(e);
                i.editReply({ content: `${config.emojis.blacklisted} Something went wrong while creating the ticket! Please report this to the bot administator${config.owner ? ' (<@' + config.owner + '>)' : ''}.\n(**${e.name}**: ${e.message})`, ephemeral: true })
            });
    }
}
