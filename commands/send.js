const fs = require('fs');
const config = require('../config.json');

module.exports = {
    name: 'send',
    aliases: ['panel'],
    description: 'send ticket panel',
    exec: async (input, message) => {
        if (message.author.id != config.owner) throw new PermissionsError('Only the owner can use this command.');
        const type = input.split(' ')[0];
        if (!fs.existsSync(`templates/panels/${type}.json`)) throw new InputError(`Panel \`${type}\` does not exist.`);
        await message.delete();
        
        return require(`../templates/panels/${type}.json`);
    }
}