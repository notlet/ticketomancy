const fs = require('fs');
const config = require('../../config.json');

module.exports = async i => {
    if (i.customId.startsWith('open_')) {
        const type = i.customId.split('_')[1];
        if (!Object.keys(config.tickets.categories).includes(type)) return i.reply({ content: `${config.emojis.blacklisted} Invalid ticket type, please contact the bot administator!${config.owner ? ' (<@' + config.owner + '>)' : ''}`, ephemeral: true });
        if ([...(config.tickets.defaults?.blacklist || []), ...(config.tickets.categories[type].blacklist || [])].map(r => i.member.roles.cache.has(r)).includes(true)) return await i.reply({ content: `${config.emojis.blacklisted} You cannot create a ticket in this category!`, ephemeral: true });
        
        if (fs.existsSync(`templates/modals/${type}.json`)) return i.showModal(require(`../../templates/modals/${type}.json`));

        await i.reply({ content: `${config.emojis.loading} Please wait, opening ticket...`, ephemeral: true });

        const newchannel = await handlers.tickets.create(i.user, type);
        return await i.editReply({ content: `${config.emojis.created} Ticket created in <#${newchannel.id}>!`, ephemeral: true }); 
    }
}