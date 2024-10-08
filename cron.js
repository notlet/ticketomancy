const { CronJob } = require('cron');
const { ObjectId } = require('mongodb');
const { dbs } = require('./ticketomancy.js');

module.exports = () => new CronJob("0 * * * *", async () => {
    const tickets = dbs.t.find({}, { _id: 1, channel: 1, type: 1, user: 1, notified: 1 });

    for await (const ticket of tickets) {
        // remove bad entries
        if (!Object.keys(config.categories).includes(ticket.type)) {
            console.log(`[cron.js] bad category "${ticket.type}" for ticket ${ticket._id}, removing database entry`);
            await dbs.t.deleteOne({ _id: ticket._id });
            continue;
        }

        const categoryConfig = config.categories[ticket.type];
        if (!categoryConfig.notice && config.defaults?.notice) categoryConfig.notice = config.defaults.notice;
        if (!categoryConfig.autoDelete && config.defaults?.autoDelete) categoryConfig.autoDelete = config.defaults.autoDelete;

        if (!categoryConfig.notice && !categoryConfig.autoDelete) return;

        const channel = client.guilds.cache.get(config.server).channels.cache.get(ticket.channel);

        // remove orphaned entries
        if (!channel) {
            console.log(`[cron.js] channel ${ticket.channel} no longer exists, removing database entry`);
            await dbs.t.deleteOne({ _id: ticket._id });
            continue;
        }

        const timestamp = (await channel.messages.fetch({ limit: 100 }))?.filter(m => !m.author.bot)?.first()?.createdTimestamp || new ObjectId(ticket._id).getTimestamp();
        const now = Date.now();

        // activity check
        if (categoryConfig.notice && now - timestamp >= categoryConfig.notice * 36e5 && !ticket.notified) {
            await channel.send({
                content: `<@${ticket.user}>`,
                embeds: [{ description: `This is an activity check; please respond to this ticket as soon as possible, or it will be deleted in ${categoryConfig.autoDelete >= 48 ? Math.floor((categoryConfig.autoDelete - categoryConfig.notice) / 24) + ' days' : (categoryConfig.autoDelete - categoryConfig.notice) + ' hours'}.` }]
            })
            await dbs.t.updateOne({ _id: ticket._id }, { $set: { notified: true } });
        } else if (categoryConfig.notice && now - timestamp <= categoryConfig.notice * 36e5) await dbs.t.updateOne({ _id: ticket._id }, { $set: { notified: false } }); 

        // auto delete
        if (categoryConfig.autoDelete && now - timestamp >= categoryConfig.autoDelete * 36e5) await handlers.tickets.delete(channel, "deleted due to inactivity", client.guilds.cache.get(config.server).members.me);
        else if (categoryConfig.autoDelete && now - timestamp >= (categoryConfig.autoDelete - (categoryConfig.autoDelete >= 48 ? 24 : 1)) * 36e5 && !ticket.deleteNotified) { // auto delete notice
            await channel.send({
                content: `<@${ticket.user}>`,
                embeds: [{ description: `This is an activity check; please respond to this ticket as soon as possible, or **it will be DELETED IN ${categoryConfig.autoDelete >= 48 ? '24 HOURS' : '1 HOUR'}**.` }]
            });
            await dbs.t.updateOne({ _id: ticket._id }, { $set: { deleteNotified: true } }); 
        } else if (categoryConfig.autoDelete && now - timestamp < (categoryConfig.autoDelete - (categoryConfig.autoDelete >= 48 ? 24 : 1)) * 36e5) await dbs.t.updateOne({ _id: ticket._id }, { $set: { deleteNotified: false } }); 
    }
}, null, true);
