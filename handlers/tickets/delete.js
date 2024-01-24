const fs = require('fs/promises');
const fss = require('fs');
const zlib = require('zlib');
const { ObjectId } = require('mongodb');
const transcript = require('discord-html-transcripts');
const config = require('../../config.json');

module.exports = async (channel, reason, closer) => {
    const ticket = await dbs.t.findOne({ channel: channel.id });
    if (!ticket) throw new InputError('This channel is not a ticket!');

    await channel.send(`${config.emojis.completed} Creating transcript and deleting ticket.`);
    const ts = await transcript.createTranscript(channel, { returnType: 'buffer', useCDN: true });
    await fs.writeFile(`data/transcripts/${channel.id}.html.br`, zlib.brotliCompressSync(ts));

    await dbs.t.deleteOne({ _id: ticket._id });
    await dbs.a.insertOne({
        type: ticket.type,
        n: ticket.n,
        user: ticket.user,
        deletedBy: closer?.id || 'unknown',
        channel: channel.id,
        reason,
        created: new Date(new ObjectId(ticket._id).getTimestamp())
    });

    await channel.delete();

    const logchannel = config.tickets.categories[ticket.type].log || config.tickets.defaults?.log || null;
    if (logchannel) await client.guilds.cache.get(config.tickets.server).channels.cache.get(logchannel).send({
        content: null,
        embeds: [
            {
                title: 'Ticket closed',
                description: `**Reason**: ${reason || 'unknown'}\n\nType: \`${ticket.type}\`\nTicket number: \`${ticket.n}\`\nOpened for: <@${ticket.user}>${closer.id ? `\nClosed by: <@${closer.id}>` : ''}`,
                color: 0xd30e0e
            }
        ],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Transcript",
                        url: `${config.url}/transcript/${channel.id}`
                    }
                ]
            }
        ]
    });
    else console.warn(`No log channel set for ${ticket.type}, skipping!`);

    if (config.tickets.categories[ticket.type].dmNotify !== false && config.tickets.defaults?.dmNotify) await client.users.send(ticket.user, {
        content: null,
        embeds: [
            {
                title: `Your ticket ${ticket.n} was closed`,
                description: `**Reason**: ${reason || 'unknown'}${closer.id ? `\n**Closed by**: ${closer.id == ticket.user ? 'You' : '<@' + closer.id + '>'}` : ''}`,
                color: 0xd30e0e
            }
        ],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Transcript",
                        url: `${config.url}/transcript/${channel.id}`
                    }
                ]
            }
        ]
    }).catch(() => {});

    return channel;
}
