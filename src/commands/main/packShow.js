const {
    pagination,
    ButtonTypes,
    ButtonStyles,
} = require("@devraelfreeze/discordjs-pagination");
const dbPack = require("../../db/packSchema.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "packlist",
    description: "Show info a specific pack",

    callback: async (client, interaction) => {
        try {
            const { packs } = await dbPack.viewPack();
            const arrayEmbeds = packs.map((pack) => {
                const embed = new EmbedBuilder()
                    .setTitle(`Pack: ${pack.type}`)
                    .setColor(0x0099ff)
                    .addFields({
                        name: "Price",
                        value: `${pack.points} points`,
                        inline: true,
                    });

                pack.rarity.forEach((rarity, index) => {
                    const itemsOfRarity = pack.items.filter(
                        (item) => item.rarity === index + 1
                    );
                    const itemNames = itemsOfRarity
                        .map((item) => item.name)
                        .join(", ");

                    embed.addFields({
                        name: `Rarity Level ${index + 1} - Roll Rate: ${
                            rarity.rollRate
                        }%`,
                        value: `Items: ${itemNames}`,
                    });
                });

                return embed;
            });

            await pagination({
                embeds: arrayEmbeds,
                author: interaction.member.user,
                interaction: interaction,
                time: 80000,
                disableButtons: false,
                fastSkip: false,
                pageTravel: false,
                buttons: [
                    {
                        type: ButtonTypes.previous,
                        label: "Previous Page",
                        style: ButtonStyles.Primary,
                    },
                    {
                        type: ButtonTypes.next,
                        label: "Next Page",
                        style: ButtonStyles.Success,
                    },
                ],
            });
        } catch (e) {
            await interaction.reply({
                content: e.message,
                ephemeral: true,
            });
        }
    },
};
