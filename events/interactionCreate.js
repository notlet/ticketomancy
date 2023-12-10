
module.exports = i => {
    if (i.isButton()) return handlers.interactions.button(i);
    else if (i.isModalSubmit()) return handlers.interactions.modal(i);
}