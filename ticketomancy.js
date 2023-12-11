const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const config = require('./config.json');

// Register discord client
global.client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [ Discord.Partials.Channel ]
});

// Custom errors
class InputError extends Error { constructor(message) { super(message); this.name = "Input Error"; }}
global.InputError = InputError;
class APIError extends Error { constructor(message) { super(message); this.name = "API Error"; }}
global.APIError = APIError;
class PermissionsError extends Error { constructor(message) { super(message); this.name = "Permissions Error"; }}
global.PermissionsError = PermissionsError;
class DBError extends Error { constructor(message) { super(message); this.name = "Database Error"; }}
global.DBError = DBError;

// Database
global.db = new MongoClient(config.keys.mongodb);

// Check if database ticketomancy exists and create if not
db.connect().then(() => db.db('ticketomancy').listCollections().toArray().then(async collections => {
        if (!collections.find(c => c.name === 'numbers')) {
            await db.db('ticketomancy').createCollection('numbers');
            await db.db('ticketomancy').collection('numbers').createIndex({ t: 1 }, { unique: true });
        }
        if (!collections.find(c => c.name === 'tickets')) {
            await db.db('ticketomancy').createCollection('tickets');
            await db.db('ticketomancy').collection('tickets').createIndex({ channel: 1 }, { unique: true });
        }
        if (!collections.find(c => c.name === 'archive')) {
            await db.db('ticketomancy').createCollection('archive');
            await db.db('ticketomancy').collection('archive').createIndex({ user: 1 });
        }
}));


global.dbs = {
    n: db.db('ticketomancy').collection('numbers'),
    t: db.db('ticketomancy').collection('tickets'),
    a: db.db('ticketomancy').collection('archive')
}

global.getDB = (filter = {}, fields = {}, collection, database = 'tickets') => new Promise(async (resolve, reject) => {
    try {
        await db.connect();
        const cursor = await db.db(database).collection(collection).find(filter, fields);
        resolve(cursor.toArray());
    } catch (e) { reject(new DBError(e)); }
});

// Load commands
global.commands = {};
fs.readdirSync('commands')
    .filter(c => c.endsWith('.js') && !c.endsWith('.disabled.js'))
    .forEach(c => commands[c.replace(/\.js$/, '')] = require(`./commands/${c}`));


// Load handlers
global.handlers = {}
fs.readdirSync('handlers').forEach(d => {
    handlers[d] = {};
    fs.readdirSync(`handlers/${d}`)
        .filter(e => e.endsWith('.js') && !e.endsWith('.disabled.js'))
        .forEach(h => handlers[d][h.split('.').slice(0, -1).join('.')] = require(`./handlers/${d}/${h}`));
});

// Load events
fs.readdirSync('events')
    .filter(e => e.endsWith('.js') && !e.endsWith('.disabled.js'))
    .forEach(e => client.on(e.split('.').slice(0, -1).join('.'), require(`./events/${e}`)));

client.on("messageCreate", message => {
    if (!(message.content.startsWith("!evalt ") && message.author.id == config.owner)) return;

    let { 1: params, 2: cmd } = message.content.replace(/\n/g, " ").match(/^!evalt( -\w{1,3})? (.+)/i);
    console.log("Evaluating: " + cmd)
    eval(`const evalFunc = async () => { ${cmd} }; evalFunc();`).then(r => {
        if (params?.includes("r")) {
            let resp = typeof r == 'object' ? JSON.stringify(r) : r;
            if (resp?.length > 1800 || params?.includes("f")) {
                message.channel.send({ content: `**Response is ${numberformatter(resp.length, 2)} characters long.** Sending it as a file.`, files: [new djs.MessageAttachment(Buffer.from(resp, 'utf-8'), "eval.txt")] });
            } else message.channel.send(`\`\`\`json\n${resp}\n\`\`\``);
        } else if (!params?.includes("r")) message.delete();
    }).catch(e => {
        message.channel.send(`**EVAL ERROR:**\n\`\`\`diff\n- ${e}\n\`\`\``);
        console.error(e)
    });
});

// Login and start up transcript server
require('./server.js')();
client.login(config.keys.discord.token);