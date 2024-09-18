module.exports = async message => {
    const match = message.content.match(/^!(\w+)( [\s\S]+)?/);
    if (!match || ![...Object.keys(commands), ...Object.keys(commands).map(c => commands[c].aliases).filter(c => !!c).flat()].includes(match[1]?.trim())) return;

    const input = match[2]?.trim();
    const command = commands[Object.keys(commands).find(c => c === match[1]?.trim() || commands[c].aliases?.includes(match[1]?.trim()))];

    let resp = "null";
    let error = false;
    let reply = command.reply ? await message.channel.send(`${config.emojis.loading} Please wait...`) : null;
    if (!command.reply) await message.channel.sendTyping();
    try {
        if (command.disabled && message.author.id !== config.owner) throw new PermissionsError(command.disabled);
        resp = await command.exec(input, message, reply);
    } catch (e) {
        if (!(e instanceof InputError || e instanceof PermissionsError)) console.error(e);
        error = e;
        resp = {
            content: null, 
            embeds: [
                {
                    title:`A${['a', 'o', 'e', 'i', 'u'].includes(e.name[0].toLowerCase()) ? "n" : ""} ${e.name} has occured.`, 
                    description: String(e).replace(/^[\w\d\s]+?: /, ""),
                    color: 0xb81d13,
                    footer: { text: `@${message.author.username}` }, 
                    timestamp: message.createdAt,
                }
            ]
        };
    } finally {
        if ((!command.preventDefault || error) && resp) {
            if (command.reply) reply.edit(resp);
            else message.channel.send(resp);
        }
    }
}