const fs = require('fs');
const config = require('../config.json');

module.exports = {
    name: 'edit',
    aliases: ['editpanel'],
    description: 'edit an already sent ticket panel',
    exec: async (input, message) => {
        if (message.author.id != config.owner) throw new PermissionsError('Only the owner can use this command.');
		const { 0: messageID, 1: type } = input.split(' ');

        if (!fs.existsSync(`templates/panels/${type}.json`)) throw new InputError(`Panel \`${type}\` does not exist.`);

		const messageToEdit = await message.channel.messages.fetch(messageID);
		if (!messageToEdit) throw new InputError(`Message \`${messageID}\` was not found in this channel.`);
		if (messageToEdit.author.id != message.guild.members.me.id) throw new InputError(`Message \`${messageID}\` was not sent by me, unable to edit it.`);

		await messageToEdit.edit(require(`../templates/panels/${type}.json`));
        await message.delete();
        
        return;
    }
}