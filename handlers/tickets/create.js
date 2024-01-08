const fs = require('fs/promises');
const fss = require('fs');
const config = require('../../config.json');
const { PermissionsBitField: Permissions, ChannelType } = require('discord.js');

module.exports = async (user, type, options) => {
    if (!Object.keys(config.tickets.categories).includes(type) || !fss.existsSync(`templates/welcomers/${type}.json`)) throw new InputError('Invalid ticket type!');
    if (!user.username || !user.id) throw new InputError('Invalid user!');

    let ticketNumber = (await dbs.n.findOne({ t: type }))?.n;
    if (typeof ticketNumber != 'number') ticketNumber = 0;
    ticketNumber++;

    const channelName = (config.tickets.categories[type].namingFormat || config.tickets.defaults?.namingFormat || `$TYPE-$NAME-$NUMBER`)
        .replaceAll('$TYPE', type)
        .replaceAll('$NAME', user.username)
        .replaceAll('$NUMBER', ticketNumber);

    const newchannel = await client.guilds.cache.get(config.tickets.server).channels.create({
        name: channelName,
        parent: (config.tickets.categories[type].category || config.tickets.defaults?.category || null),
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: client.guilds.cache.get(config.tickets.server).id,
                deny: [
                    Permissions.Flags.ViewChannel
                ]
            },
            {
                id: client.user.id,
                allow: [
                    Permissions.Flags.ViewChannel,
                    Permissions.Flags.ReadMessageHistory,
                    Permissions.Flags.SendMessages
                ]
            },
            {
                id: user.id,
                allow: [
                    Permissions.Flags.ViewChannel,
                    Permissions.Flags.ReadMessageHistory,
                    Permissions.Flags.SendMessages
                ]
            },
            ...config.tickets.categories[type].team.map(t => ({
                id: t,
                allow: [
                    Permissions.Flags.ViewChannel,
                    Permissions.Flags.ReadMessageHistory,
                    Permissions.Flags.SendMessages
                ]
            }))
        ]
    });

    await dbs.t.insertOne({ user: user.id, channel: newchannel.id, type, n: ticketNumber });
    await dbs.n.updateOne({ t: type }, { $set: { n: ticketNumber } }, { upsert: true });

    const welcomeMessage = JSON.parse((await fs.readFile(`templates/welcomers/${type}.json`, 'utf8'))
        .replaceAll('$USER', user.id)
        .replaceAll('$NUMBER', ticketNumber)
        .replaceAll('$PREFIX', config.prefix)
    );

    if (options) {
        const mappings = fss.existsSync(`templates/fields/${type}.json`) ? require(`../../templates/fields/${type}.json`) : {};
        welcomeMessage.embeds.push({
            fields: Object.keys(options).map(o => options[o] ?({ name: mappings[o] || o, value: options[o].replace(/(\*|_|`|~|\\)/g, '\\$1') }) : null).filter(f => !!f),
            color: 0
        })
    }

    await newchannel.send(welcomeMessage);

    const logchannel = config.tickets.categories[type].log || config.tickets.defaults?.log || null;
    if (logchannel) await client.guilds.cache.get(config.tickets.server).channels.cache.get(logchannel).send({
        content: null,
        embeds: [
            {
                title: 'Ticket created',
                description: `Type: \`${type}\`\nTicket number: \`${ticketNumber}\`\nOpened for: <@${user.id}>`,
                color: 0x20c407
            },
        ]
    });

    return newchannel;
}
