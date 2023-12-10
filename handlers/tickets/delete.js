const fs = require('fs/promises');
const fss = require('fs');
const zlib = require('zlib');
const transcript = require('discord-html-transcripts');
const config = require('../../config.json');

module.exports = async (reason, channel, message) => {
    if (!Object.values(config.tickets.categories).includes(`${channel.parentId}`)) throw new InputError('This channel is not a ticket!');

    const ticket = await dbs.t.findOne({ channel: channel.id });
    if (!ticket) throw new InputError('This channel is not a ticket!');

    await channel.send('<a:loading:997429178163019806> Creating transcript and deleting ticket...');
    const ts = await transcript.createTranscript(channel, { returnType: 'buffer', useCDN: true });
    await fs.writeFile(`data/transcripts/${channel.id}.html.gz`, zlib.gzipSync(ts), 'utf8');

    await dbs.t.deleteOne({ channel: channel.id });
    await channel.delete();

    return client.guilds.cache.get(config.tickets.server).channels.cache.get(config.tickets.log).send({
        content: null,
        embeds: [
            {
                title: 'Ticket deleted',
                description: `Reason: \`${reason || unknown}\`\nType: \`${ticket.type}\`\nTicket number: \`${ticket.n}\`\nOpened for: <@${ticket.user}>\n${message?.author?.id ? `Closed by: <@${message?.author?.id}>\n` : ''}\nTranscript: [Click here](${config.url}/${channel.id})`,
                color: '#d30e0e'
            }
        ]
    })
}
