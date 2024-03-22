const {
    pagination,
    ButtonTypes,
    ButtonStyles,
} = require("@devraelfreeze/discordjs-pagination");
const dbItem = require("../../db/itemSchema.js");
const { EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "item",
    description: "Assign an item to a pack",
    options: [
        {
            name: "create",
            description: "Create a new item",
            type: 1,
            options: [
                {
                    name: "pack",
                    type: 3,
                    description: "The type of the pack the item belongs to",
                    required: true,
                },
                {
                    name: "name",
                    type: 3,
                    description: "The name of the item",
                    required: true,
                },
                {
                    name: "image",
                    type: 3,
                    description: "The image URL of the item",
                    required: true,
                },
                {
                    name: "rarity",
                    type: 10,
                    description: "The rarity level of the item",
                    required: true,
                },
            ],
        },
        {
            name: "edit",
            description: "Create a new item",
            type: 1,
            options: [
                {
                    name: "pack",
                    type: 3,
                    description: "The type of the pack the item belongs to",
                    required: true,
                },
                {
                    name: "item",
                    type: 3,
                    description: "The name of the item to edit",
                    required: true,
                },
                {
                    name: "name",
                    type: 3,
                    description: "The new name of the item",
                    required: false,
                },
                {
                    name: "rarity",
                    type: 10,
                    description: "The rarity level of the item",
                    required: false,
                },
                {
                    name: "image",
                    type: 3,
                    description: "The image URL of the item",
                    required: false,
                },
            ],
        },
        {
            name: "delete",
            description: "Create a new item",
            type: 1,
            options: [
                {
                    name: "name",
                    type: 3,
                    description: "The name of the item",
                    required: true,
                },
                {
                    name: "pack",
                    type: 3,
                    description: "The type of the pack the item belongs to",
                    required: true,
                },
            ],
        },
        {
            name: "view",
            description: "View item list as admin interface",
            type: 1,
            options: [
                {
                    name: "pack",
                    type: 3,
                    description: "The type of the pack the item belongs to",
                    required: true,
                },
            ],
        },

        // other subcommands...
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const command = interaction.options.getSubcommand();
        const name = interaction.options.getString("name");
        const image = interaction.options.getString("image");
        const rarity = interaction.options.getNumber("rarity");
        const pack = interaction.options.getString("pack");
        const item = interaction.options.getString("item");

        switch (command) {
            case "create":
                try {
                    const item = await dbItem.createItem(pack, {
                        name: name,
                        image: image,
                        rarity: rarity,
                    });

                    await interaction.reply(
                        `Item **${item.name}** has been created in pack **${pack}**.`
                    );
                } catch (error) {
                    await interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "edit":
                try {
                    await dbItem.updateItem(item, pack, {
                        name: name,
                        image: image,
                        rarity: rarity,
                    });

                    await interaction.reply(
                        `Item **${item}** has been updated in pack **${pack}**.`
                    );
                } catch (error) {
                    await interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "delete":
                try {
                    await dbItem.deleteItem(name, pack);
                    await interaction.reply(
                        `Item **${name}** has been deleted from pack **${pack}**.`
                    );
                } catch (error) {
                    await interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "view":
                const packName = interaction.options.getString("pack");

                try {
                    const { pack, items } = await dbItem.readAllItemsInPack(
                        packName
                    );

                    const arrayEmbeds = items.map((item) => {
                        const rarityRollRate = pack.rarity.find(
                            (rarity) => rarity.level === item.rarity
                        ).rollRate;

                        let imageUrl = null;
                        try {
                            const url = new URL(item.image);
                            imageUrl = url.href;
                        } catch (error) {}

                        const embed = new EmbedBuilder()
                            .setTitle(`Item name: ${item.name}`)
                            .addFields({
                                name: `Pack ID:`,
                                value: `${pack._id}`,
                            })
                            .addFields({
                                name: `Item ID:`,
                                value: `${item.id}`,
                            })
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
                            .addFields({
                                name: `Image link:`,
                                value: `${item.image}`,
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
                        disableButtons: true,
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
                break;

            // Handle other subcommands here...
        }
    },
};
