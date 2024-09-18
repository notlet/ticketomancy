module.exports = message => {
    if (message.content.startsWith(config.prefix)) handlers.commands.handler(message);
}