const fs = require('fs');
const config = require('../../config.json')

module.exports = async i => {
    if (i.customId.startsWith('open_')) {
        await i.reply({ content: `${config.emojis.loading} Please wait, opening ticket...`, ephemeral: true });

        const type = i.customId.split('_')[1];
        if (config.tickets.categories[type].blacklist.map(r => i.member.roles.cache.has(r)).includes(true)) return await i.editReply({ content: `${config.emojis.blacklisted} You cannot create a ticket in this category!`, ephemeral: true });

        if (fs.existsSync(`json/modals/${type}.json`)) return i.showModal(require(`../../json/modals/${type}.json`));

        const newchannel = await handlers.tickets.create(i.user, type);
        return await i.editReply({ content: `${config.emojis.created} Ticket created in <#${newchannel.id}>!`, ephemeral: true }); 
    }
}