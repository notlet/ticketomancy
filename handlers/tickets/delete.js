const fs = require('fs/promises');
const fss = require('fs');
const zlib = require('zlib');
const { ObjectId } = require('mongodb');
const transcript = require('discord-html-transcripts');
const config = require('../../config.json');

module.exports = async (channel, reason, closer) => {
    if (!Object.keys(config.tickets.categories).map(t => config.tickets.categories[t].category).includes(`${channel.parentId}`)) throw new InputError('This channel is not a ticket!');

    const ticket = await dbs.t.findOne({ channel: channel.id });
    if (!ticket) throw new InputError('This channel is not a ticket!');

    await channel.send(`${config.emojis.loading} Creating transcript and deleting ticket...`);
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

    if (config.tickets.categories[ticket.type].log) await client.guilds.cache.get(config.tickets.server).channels.cache.get(config.tickets.categories[ticket.type].log).send({
        content: null,
        embeds: [
            {
                title: 'Ticket closed',
                description: `**Reason**: ${reason || 'unknown'}\n**Transcript**: [<link>](${config.url}/transcript/${channel.id})\n\nType: \`${ticket.type}\`\nTicket number: \`${ticket.n}\`\nOpened for: <@${ticket.user}>${closer.id ? `\nClosed by: <@${closer.id}>` : ''}`,
                color: 0xd30e0e
            }
        ]
    });
    else console.warn(`No log channel set for ${ticket.type}, skipping!`);

    if (config.tickets.categories[ticket.type].dmNotify) await client.users.send(ticket.user, {
        content: null,
        embeds: [
            {
                title: `Your ticket ${ticket.n} was closed`,
                description: `**Reason**: ${reason || 'unknown'}${closer.id ? `\n**Closed by**: ${closer.id == ticket.user ? 'You' : '<@' + closer.id + '>'}` : ''}`,
                color: 0xd30e0e
            }
        ]
    }).catch(console.warn);

    return channel;
}
