const dbPack = require("../../db/packSchema");
const dbItem = require("../../db/itemSchema");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "pack",
    description: "Manage packs",
    options: [
        {
            name: "create",
            description: "Create a new pack",
            type: 1,
            options: [
                {
                    name: "type",
                    type: 3,
                    description: "The type of the pack",
                    required: true,
                },
                {
                    name: "points",
                    type: 4,
                    description:
                        "The number of points required to roll the pack",
                    required: true,
                },
                ...Array.from({ length: 10 }, (_, i) => ({
                    name: `rarity-${i + 1}`,
                    type: 10,
                    description: `The roll rate for rarity level ${i + 1}`,
                    required: false,
                })),
            ],
        },

        {
            name: "edit",
            description: "Edit an existing pack",
            type: 1,
            options: [
                {
                    name: "type",
                    type: 3,
                    description: "The type of the pack to edit",
                    required: true,
                },
                {
                    name: "name",
                    type: 3,
                    description: "The new name of the pack",
                    required: false,
                },
                {
                    name: "points",
                    type: 4,
                    description:
                        "The number of points required to roll the pack",
                    required: false,
                },
                ...Array.from({ length: 10 }, (_, i) => ({
                    name: `rarity-${i + 1}`,
                    type: 10,
                    description: `The new roll rate for rarity level ${i + 1}`,
                    required: false,
                })),
            ],
        },

        {
            name: "delete",
            description: "Delete an existing pack",
            type: 1,
            options: [
                {
                    name: "type",
                    type: 3,
                    description: "The type of the pack to delete",
                    required: true,
                },
            ],
        },

        // Add more command options here...
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const command = interaction.options.getSubcommand();
        const type = interaction.options.getString("type");
        const points = interaction.options.getInteger("points");
        const rarity = Array.from({ length: 10 }, (_, i) =>
            interaction.options.getNumber(`rarity-${i + 1}`)
        );

        switch (command) {
            case "create":
                try {
                    await dbPack.createPack({ type, points, rarity });
                    interaction.reply(`Pack **${type}** has been created.`);
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "edit":
                const newName = interaction.options.getString("name");
                try {
                    await dbPack.editPack(type, newName, points, rarity);
                    interaction.reply(`Pack **${type}** has been updated.`);
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "delete":
                try {
                    await dbPack.deletePack(type);
                    interaction.reply(`Pack **${type}** has been deleted.`);
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;
            // Handle other subcommands...
        }
    },
};
