const config = require('../../config.json');

module.exports = async i => {
    if (i.customId.startsWith('modal_')) {
        const type = i.customId.split('_')[1];
        if (!Object.keys(config.tickets.categories).includes(type)) throw new SyntaxError('Invalid ticket type!');

        const components = {};
        i.toJSON().fields.components.forEach(c => components[c.components[0].customId] = c.components[0].value);

        await i.reply({ content: `${config.emojis.loading} Please wait, opening ticket...`, ephemeral: true });
        const newchannel = await handlers.tickets.create(i.user, type, components);
        return await i.editReply({ content: `${config.emojis.created} Ticket created in <#${newchannel.id}>!`, ephemeral: true });
    }
}