const {
    pagination,
    ButtonTypes,
    ButtonStyles,
} = require("@devraelfreeze/discordjs-pagination");
const { Item, Pack } = require("../../db/packSchema.js");
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

        // Find the pack by its name
        const pack = await Pack.findOne({ type: packName });

        if (!pack) {
            await interaction.reply({
                content: `Pack **${packName}** does not exist.`,
                ephemeral: true,
            });
            return;
        }

        const items = await Item.find({ pack: pack._id }).populate("pack");
        if (!items.length) {
            await interaction.reply({
                content: `No items found in pack **${packName}**.`,
                ephemeral: true,
            });
            return;
        }

        const arrayEmbeds = items.map((item, index) => {
            const rarityRollRate = pack.rarity.find(
                (rarity) => rarity.level === item.rarity
            ).rollRate;
            const embed = new EmbedBuilder()
                .setTitle(`Item ${index + 1}: ${item.name}`)
                .setDescription(
                    `Rarity: ${item.rarity} - Roll Rate: ${rarityRollRate}%`
                )
                .setImage(item.image)
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
    },
};
