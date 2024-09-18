const fs = require('fs/promises');
const fss = require('fs');
const { dbs } = require('../../ticketomancy.js');
const { ChannelType } = require('discord.js');


module.exports = async (user, type, options) => {
    if (!Object.keys(config.categories).includes(type)) throw new InputError('Invalid ticket type!');
    if (!user.username || !user.id) throw new InputError('Invalid user!');

    let ticketNumber = (await dbs.n.findOne({ t: type }))?.n;
    if (typeof ticketNumber != 'number') ticketNumber = 0;
    ticketNumber++;

    const channelName = (config.categories[type].namingFormat || config.defaults?.namingFormat || `$TYPE-$NAME-$NUMBER`)
        .replaceAll('$TYPE', type)
        .replaceAll('$NAME', user.username)
        .replaceAll('$NUMBER', ticketNumber);

    const newchannel = await client.guilds.cache.get(config.server).channels.create({
        name: channelName,
        parent: (config.categories[type].category || config.defaults?.category || null),
        type: ChannelType.GuildText,
        reason: `Ticket #${ticketNumber} created for ${user.username} in category ${type}`
    });

    await newchannel.permissionOverwrites.edit(client.user.id, {
        ViewChannel: true,
        ReadMessageHistory: true,
        SendMessages: true
    });

    await newchannel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        ReadMessageHistory: true,
        SendMessages: true
    });

    for (const t of config.categories[type].team) await newchannel.permissionOverwrites.edit(t, {
        ViewChannel: true,
        ReadMessageHistory: true,
        SendMessages: true
    });


    await dbs.t.insertOne({ user: user.id, channel: newchannel.id, type, n: ticketNumber });
    await dbs.n.updateOne({ t: type }, { $set: { n: ticketNumber } }, { upsert: true });

    const welcomeMessage = JSON.parse(JSON.stringify(config.categories[type].welcomer)
        .replaceAll('$USER', user.id)
        .replaceAll('$NUMBER', ticketNumber)
        .replaceAll('$PREFIX', config.prefix)
    )

    if (options) welcomeMessage.embeds.push({
        fields: Object.keys(options).map(o => options[o] ?({ name: config.categories[type].fields ? config.categories[type].fields[o] : o, value: options[o].replace(/([*_`~\\])/g, '\\$1') }) : null).filter(f => !!f),
        color: 0
    })

    await newchannel.send(welcomeMessage);

    const logchannel = config.categories[type].log || config.defaults?.log || null;
    if (logchannel) await client.guilds.cache.get(config.server).channels.cache.get(logchannel).send({
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
