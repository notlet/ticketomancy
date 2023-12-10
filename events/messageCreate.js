const config = require('../config.json');

module.exports = message => {
    if (message.content.startsWith(config.prefix)) handlers.commands.handler(message);
}