const {
    pagination,
    ButtonTypes,
    ButtonStyles,
} = require("@devraelfreeze/discordjs-pagination");
const dbItem = require("../../db/itemQueries");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "itemlist",
    description: "Show info about items in a specific pack",
    options: [
        {
            name: "pack",
            type: 3,
            description: "The name of the pack",
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        const packName = interaction.options.getString("pack");

        try {
            const { pack, items } = await dbItem.readAllItemsInPack(packName);

            const arrayEmbeds = items.map((item, index) => {
                const rarityRollRate = pack.rarity.find(
                    (rarity) => rarity.level === item.rarity
                ).rollRate;

                let imageUrl = null;
                try {
                    const url = new URL(item.image);
                    imageUrl = url.href;
                } catch (error) {}

                const embed = new EmbedBuilder()
                    .setTitle(`Item ${index + 1}: ${item.name}`)
                    .addFields({
                        name: `Roll Rate:`,
                        value: `${rarityRollRate}%`,
                        inline: true,
                    })
                    .addFields({
                        name: `Rarity:`,
                        value: `${item.rarity}`,
                        inline: true,
                    })
                    .setImage(imageUrl)
                    .setColor(0x0099ff);
                return embed;
            });

            await pagination({
                embeds: arrayEmbeds,
                author: interaction.member.user,
                interaction: interaction,
                time: 80000,
                disableButtons: false,
                fastSkip: false,
                pageTravel: true,
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
        } catch (error) {
            await interaction.reply({
                content: error.message,
                ephemeral: true,
            });
        }
    },
};
