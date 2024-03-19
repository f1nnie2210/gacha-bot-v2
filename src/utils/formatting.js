const { EmbedBuilder } = require("discord.js");

function formatPage(packs) {
    const embed = new EmbedBuilder().setTitle("Packs").setColor(0x0099ff);

    packs.forEach((pack, index) => {
        embed.addFields({
            name: `Pack ${index + 1}`,
            value: `Type: ${pack.type}\nItems: ${pack.items.length}`,
        });
    });

    return embed;
}

module.exports = formatPage;
