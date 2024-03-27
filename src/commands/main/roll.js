const { Pack } = require("../../db/schema/schema");
const dbUser = require("../../db/userQueries");
const { EmbedBuilder } = require("discord.js");
const { rollItem } = require("../../handlers/rollHandle");
const { getAllAllowedChannels } = require("../../db/channelQueries");

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

            const allowedChannels = await getAllAllowedChannels();
            if (
                !allowedChannels.some(
                    (channel) => channel.channelId === interaction.channel.id
                )
            ) {
                await interaction.reply({
                    content: `This command can't be executed in this channel.`,
                    ephemeral: true,
                });
                return;
            }
            if (!pack || !pack.items.length) {
                let message = `The pack: **${packName}** does not exist.`;
                if (pack && !pack.items.length) {
                    message = `The pack: **${packName}** has no items to roll.`;
                }
                await interaction.reply({ content: message, ephemeral: true });
                return;
            }
            const user = await dbUser.findUser(interaction.user.id);
            if (user.points < pack.points) {
                await interaction.reply({
                    content: `You don't have enough points to roll this pack.`,
                    ephemeral: true,
                });
                return;
            }

            const item = await rollItem(pack, user);

            user.points -= pack.points;
            await user.save();

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
