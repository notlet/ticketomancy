module.exports = {
    name: "ping",
    description: 'get bot\'s api latency',
    exec: (input, message) => `� Ping is \`${Date.now() - message.createdTimestamp}ms\`, API Latency is \`${Math.round(client.ws.ping)}ms\`.`
}