const { Pack, Item } = require("../../db/packSchema");
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

        // other subcommands...
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const command = interaction.options.getSubcommand();

        switch (command) {
            case "create":
                const itemName = interaction.options.getString("name");
                const itemImage = interaction.options.getString("image");
                const itemRarity = interaction.options.getNumber("rarity");
                const packName = interaction.options.getString("pack");

                const pack = await Pack.findOne({ type: packName });
                if (!pack) {
                    await interaction.reply({
                        content: `Pack **${packName}** does not exist.`,
                        ephemeral: true,
                    });
                    return;
                }
                // Check if an item with the same name already exists
                const existingItem = await Item.findOne({ name: itemName });
                if (existingItem) {
                    await interaction.reply({
                        content: `An item with the name **${itemName}** already exists.`,
                        ephemeral: true,
                    });
                    return;
                }
                // Check if the item's rarity level exists in the pack
                const rarityExists = pack.rarity.some(
                    ({ level }) => level === itemRarity
                );
                if (!rarityExists) {
                    await interaction.reply({
                        content: `Rarity level **${itemRarity}** does not exist in pack **${packName}**.`,
                        ephemeral: true,
                    });
                    return;
                }

                const item = new Item({
                    name: itemName,
                    image: itemImage,
                    rarity: itemRarity,
                    pack: pack._id,
                });
                pack.items.push(item._id);
                await pack.save();
                await item.save();

                await interaction.reply(
                    `Item **${itemName}** has been created and added to pack **${packName}**.`
                );
                break;

            case "edit":
                const itemToEdit = interaction.options.getString("item");
                const newItemName = interaction.options.getString("name");
                const newItemImage = interaction.options.getString("image");
                const newItemRarity = interaction.options.getNumber("rarity");

                // Find the item in your database
                const editItem = await Item.findOne({ name: itemToEdit });

                if (!editItem) {
                    await interaction.reply({
                        content: `Item **${itemToEdit}** does not exist.`,
                        ephemeral: true,
                    });
                    return;
                }

                // If a new rarity is provided, check if it exists in the pack
                if (newItemRarity) {
                    const pack = await Pack.findById(editItem.pack);
                    const rarityExists = pack.rarity.some(
                        ({ level }) => level === newItemRarity
                    );

                    if (!rarityExists) {
                        await interaction.reply({
                            content: `Rarity level **${newItemRarity}** does not exist in pack **${pack.type}**.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    editItem.rarity = newItemRarity;
                }

                // Update the item's properties if the corresponding option was provided
                if (newItemName) {
                    editItem.name = newItemName;
                }
                if (newItemImage) {
                    editItem.image = newItemImage;
                }

                // Save the updated item to your database
                await editItem.save();

                await interaction.reply(
                    `Item **${itemToEdit}** has been updated.`
                );
                break;

            case "delete":
                const itemNameToDelete = interaction.options.getString("name");
                const deletePackName = interaction.options.getString("pack");
                const deletePack = await Pack.findOne({
                    type: deletePackName,
                }).populate("items");

                if (!deletePack) {
                    await interaction.reply({
                        content: `Pack **${deletePackName}** does not exist.`,
                        ephemeral: true,
                    });
                    return;
                }

                const itemToDelete = deletePack.items.find(
                    (item) => item.name === itemNameToDelete
                );

                if (!itemToDelete) {
                    await interaction.reply({
                        content: `Item **${itemNameToDelete}** does not exist in pack **${deletePackName}**.`,
                        ephemeral: true,
                    });
                    return;
                }

                deletePack.items = deletePack.items.filter(
                    (item) => item._id !== itemToDelete._id
                );
                await deletePack.save();
                await Item.deleteOne({ _id: itemToDelete._id });

                await interaction.reply(
                    `Item **${itemNameToDelete}** has been deleted from pack **${deletePackName}**.`
                );
                break;

            // Handle other subcommands here...
        }
    },
};
