const { EmbedBuilder } = require("discord.js");

// Server information
const serverInfo = {
    name: "Red County Roleplay",
    ipAddress: "rcrp.vn",
    website: "https://ucp.rcrp.vn",
    logoUrl: "https://i.imgur.com/AfFp7pu.png",
    instructions: "...",
};

module.exports = {
    name: "help",
    description: "Show server info and some slash command",
    callback: async (client, interaction) => {
        await interaction.deferReply();

        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(serverInfo.name)
            .setURL(serverInfo.website)
            .setAuthor({
                name: "Bot",
                iconURL: serverInfo.logoUrl,
                url: "https://discord.js.org",
            })
            .setDescription(serverInfo.instructions)
            .addFields({
                name: "IP Server",
                value: serverInfo.ipAddress,
            })
            .addFields({
                name: "Website",
                value: serverInfo.website,
            })
            .setThumbnail(serverInfo.logoUrl)
            .setImage(serverInfo.logoUrl)
            .setTimestamp()
            .setFooter({
                text: "RCRP",
                iconURL: serverInfo.logoUrl,
            });

        await interaction.editReply({ embeds: [helpEmbed] });
    },
};
