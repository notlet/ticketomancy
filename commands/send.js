const fs = require('fs');

module.exports = {
    name: 'send',
    aliases: ['panel'],
    description: 'send ticket panel',
    exec: async (input, message) => {
        if (message.author.id != config.owner) throw new PermissionsError('Only the owner can use this command.');
        const type = input.split(' ')[0];
        if (!Object.keys(config.panels).includes(type)) throw new InputError(`Panel \`${type}\` does not exist.`);
        await message.delete();
        
        return config.panels[type];
    }
}