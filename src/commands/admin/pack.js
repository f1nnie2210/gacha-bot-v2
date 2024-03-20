const { Pack, Item } = require("../../db/packSchema");
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

        switch (command) {
            case "create":
                const createType = interaction.options.getString("type");
                const createPoint = interaction.options.getInteger("points");
                const existingPack = await Pack.findOne({ type: createType });
                if (existingPack) {
                    await interaction.reply({
                        content: `A pack with the name **${createType}** already exists.`,
                        ephemeral: true,
                    });
                    return;
                }

                const createRarity = Array.from({ length: 10 }, (_, i) => {
                    const rollRate = interaction.options.getNumber(
                        `rarity-${i + 1}`
                    );
                    return { level: i + 1, rollRate: rollRate || 0 };
                }).filter(({ rollRate }) => rollRate > 0);

                const totalRollRate = createRarity.reduce(
                    (total, { rollRate }) => total + rollRate,
                    0
                );

                if (totalRollRate > 100) {
                    await interaction.reply({
                        content: `The total roll rate cannot exceed 100%. Your input was **${totalRollRate}%**.`,
                        ephemeral: true,
                    });
                    return;
                }

                const newPack = new Pack({
                    type: createType,
                    points: createPoint,
                    rarity: createRarity,
                });

                try {
                    await newPack.save();
                    await interaction.reply(
                        `Pack **${createType}** has been created.`
                    );
                } catch (error) {
                    console.error(error);
                    await interaction.reply({
                        content: `There was an error while creating the pack. Please try again.`,
                        ephemeral: true,
                    });
                }
                break;

            case "edit":
                try {
                    const editType = interaction.options.getString("type");
                    const editPack = await Pack.findOne({ type: editType });
                    if (!editPack) {
                        await interaction.reply({
                            content: `Pack **${editType}** does not exist.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const newName = interaction.options.getString("name");
                    if (newName) {
                        const existingPack = await Pack.findOne({
                            type: newName,
                        });
                        if (existingPack) {
                            await interaction.reply({
                                content: `A pack with the name **${newName}** already exists.`,
                                ephemeral: true,
                            });
                            return;
                        }
                        editPack.type = newName;
                    }
                    const points = interaction.options.getInteger("points");
                    if (points !== null) {
                        editPack.points = points;
                    }

                    const existingRarity = new Map(
                        editPack.rarity.map((r) => [r.level, r.rollRate])
                    );

                    const editRarity = Array.from({ length: 10 }, (_, i) => {
                        const rollRate = interaction.options.getNumber(
                            `rarity-${i + 1}`
                        );
                        if (rollRate === 0) {
                            return null;
                        }
                        return rollRate !== null
                            ? { level: i + 1, rollRate }
                            : existingRarity.has(i + 1)
                            ? {
                                  level: i + 1,
                                  rollRate: existingRarity.get(i + 1),
                              }
                            : null;
                    }).filter(Boolean);

                    const totalRollRate = editRarity.reduce(
                        (total, r) => total + r.rollRate,
                        0
                    );

                    if (totalRollRate > 100) {
                        await interaction.reply({
                            content: "The total roll rate cannot exceed 100%.",
                            ephemeral: true,
                        });
                        return;
                    }
                    editPack.rarity = editRarity;
                    await editPack.save();

                    await interaction.reply(
                        `Pack **${editType}** has been updated.`
                    );
                } catch (error) {
                    console.error(error);
                }
                break;

            case "delete":
                const deleteType = interaction.options.getString("type");
                const packToDelete = await Pack.findOne({ type: deleteType });

                if (!packToDelete) {
                    await interaction.reply({
                        content: `Pack **${deleteType}** does not exist.`,
                        ephemeral: true,
                    });
                    return;
                }

                // Delete all items that reference the pack
                await Item.deleteMany({ pack: packToDelete._id });

                await Pack.deleteOne({ type: deleteType });

                await interaction.reply(
                    `Pack **${deleteType}** and all its items have been deleted.`
                );
                break;
            // Handle other subcommands...
        }
    },
};
