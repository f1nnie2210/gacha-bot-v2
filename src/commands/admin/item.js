const { Pack, Item } = require("../../db/packSchema");

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
        // other subcommands...
    ],
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
            // Handle other subcommands here...
        }
    },
};
