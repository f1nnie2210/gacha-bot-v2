const { Pack } = require("../../db/packSchema");
const dbOperations = require("../../db/operations");
const { EmbedBuilder, UserSelectMenuBuilder } = require("discord.js");
const { rollItem } = require("../../handlers/rollHandle");

module.exports = {
    name: "roll",
    description: "Roll a gacha",
    options: [
        {
            name: "pack",
            description: "choose a pack",
            type: 3,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            const packName = interaction.options.getString("pack");
            const pack = await Pack.findOne({ type: packName });

            if (!pack || !pack.items.length) {
                let message = `The pack: **${packName}** does not exist.`;
                if (pack && !pack.items.length) {
                    message = `The pack: **${packName}** has no items to roll.`;
                }
                await interaction.reply({ content: message, ephemeral: true });
                return;
            }
            const user = await dbOperations.findUser(interaction.user.id);
            if (user.points < pack.points) {
                await interaction.reply({
                    content: `You don't have enough points to roll this pack.`,
                    ephemeral: true,
                });
                return;
            }

            user.points -= pack.points;
            await user.save();
            const item = await rollItem(pack);

            const embed = new EmbedBuilder()
                .setTitle(`You rolled an item from pack: ${packName}`)
                .addFields({
                    name: "Item Name",
                    value: `${item.name}`,
                    inline: true,
                })
                .addFields({
                    name: "Rarity",
                    value: `${item.rarity}`,
                    inline: true,
                })
                .addFields({
                    name: "Remaining points",
                    value: `${user.points}`,
                    inline: true,
                })
                .setImage(item.image)
                .setColor(0x0099ff);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },
};
