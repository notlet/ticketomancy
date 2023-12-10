module.exports = {
    name: "ping",
    desc: {
        short: "get bot's ping.",
        long: "Get the bot's latency/ping."
    },
    exec: (args, input, message, reply) => `� Ping is \`${Date.now() - message.createdTimestamp}ms\`, API Latency is \`${Math.round(client.ws.ping)}ms\`.`
}