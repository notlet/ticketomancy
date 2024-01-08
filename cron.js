const config = require('./config.json');
const { CronJob } = require('cron');
const { ObjectId } = require('mongodb');

module.exports = () => new CronJob("0 * * * *", async () => {
    const tickets = dbs.t.find({}, { _id: 1, channel: 1, type: 1, user: 1, notified: 1 });

    for await (const ticket of tickets) {
        const categoryConfig = config.tickets.categories[ticket.type];
        if (!categoryConfig.notice && config.tickets.defaults?.notce) categoryConfig.notice = config.tickets.defaults.notice;
        if (!categoryConfig.autoDelete && config.tickets.defaults?.autoDelete) categoryConfig.autoDelete = config.tickets.defaults.autoDelete;

        if (!categoryConfig.notice && !categoryConfig.autoDelete) return;

        const channel = client.guilds.cache.get(config.tickets.server).channels.cache.get(ticket.channel);

        // remove orphaned entries
        if (!channel) {
            await dbs.t.deleteOne({ _id: ticket._id });
            continue;
        }

        const timestamp = (await channel.messages.fetch({ limit: 100 }))?.filter(m => !m.author.bot)?.last()?.createdTimestamp || new ObjectId(ticket._id).getTimestamp();
        const currentTimestamp = Date.now();

        // activity check
        if (categoryConfig.notice && currentTimestamp - timestamp >= categoryConfig.notice * 36e5 && !ticket.notified) {
            await channel.send({
                content: `<@${ticket.user}>`,
                embeds: [{ description: "This is an activity check; please respond to this ticket as soon as possible, or this ticket will be deleted soon." }]
            })
            await dbs.t.updateOne({ _id: ticket._id }, { $set: { notified: true } });
        } 

        // auto delete 
        if (categoryConfig.autoDelete && currentTimestamp - timestamp >= categoryConfig.autoDelete * 36e5) await handlers.tickets.delete(channel, "deleted due to inactivity", client.guilds.cache.get(config.tickets.server).members.me);
        else if (categoryConfig.autoDelete && currentTimestamp - timestamp >= (categoryConfig.autoDelete - 1) * 36e5) { // auto delete notice
            await channel.send({
                content: `<@${ticket.user}>`,
                embeds: [{ description: "This is an activity check; please respond to this ticket as soon as possible, or this ticket will be **DELETED IN 1 HOUR**." }]
            });
        }
    }
}, null, true);
