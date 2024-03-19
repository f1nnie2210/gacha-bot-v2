const dbOperations = require("../../db/operations");
const cloudinary = require("cloudinary").v2;
const { Pack, Item } = require("../../db/packSchema");
const {
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");
const formatPage = require("../../utils/formatting");

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
                ...Array.from({ length: 10 }, (_, i) => ({
                    name: `rarity-${i + 1}`,
                    type: 10,
                    description: `The roll rate for rarity level ${i + 1}`,
                    required: false,
                })),
            ],
        },
        {
            name: "list",
            description: "View all existed packs",
            type: 1,
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
        {
            name: "view",
            description: "View an existing pack",
            type: 1,
            options: [
                {
                    name: "type",
                    type: 3,
                    description: "The type of the pack to view",
                    required: true,
                },
            ],
        },
        // Add more command options here...
    ],

    callback: async (client, interaction) => {
        const command = interaction.options.getSubcommand();
        if (
            ["create", "edit", "delete"].includes(command) &&
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator
            )
        ) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }
        switch (command) {
            case "create":
                const createType = interaction.options.getString("type");
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

            case "list":
                const packs = await Pack.find({});
                if (!packs.length) {
                    await interaction.reply({
                        content: `No packs found.`,
                        ephemeral: true,
                    });
                    return;
                }

                const embed = formatPage(packs);
                await interaction.reply({ embeds: [embed] });
                break;

            case "edit":
                const editType = interaction.options
                    .getString("type")
                    .toLowerCase();
                const editPack = await Pack.findOne({
                    type: { $regex: new RegExp(editType, "i") },
                });
                if (!editPack) {
                    await interaction.reply({
                        content: `Pack **${editType}** does not exist.`,
                        ephemeral: true,
                    });
                    return;
                }

                const editRarity = Array.from({ length: 10 }, (_, i) => {
                    const rollRate = interaction.options.getNumber(
                        `rarity-${i + 1}`
                    );
                    return rollRate !== null
                        ? { level: i + 1, rollRate }
                        : null;
                }).filter(Boolean);

                editPack.rarity = editRarity;
                await editPack.save();

                await interaction.reply(
                    `Pack **${editType}** has been updated.`
                );
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

            case "view":
                const viewType = interaction.options.getString("type");
                const packToView = await Pack.findOne({
                    type: viewType,
                }).populate("items");

                if (!packToView) {
                    await interaction.reply({
                        content: `Pack **${viewType}** does not exist.`,
                        ephemeral: true,
                    });
                    return;
                }

                const packEmbed = new EmbedBuilder()
                    .setTitle(`Pack: ${viewType}`)
                    .setColor(0x0099ff);

                // Display rarity levels with roll rates
                packToView.rarity.forEach((rarity) => {
                    packEmbed.addFields({
                        name: `Rarity level ${rarity.level}`,
                        value: `${rarity.rollRate}%`,
                    });
                });

                // Display items
                let items = "";
                packToView.items.forEach((item) => {
                    items += `${item.name}: Rarity level: ${item.rarity}\n`;
                });
                packEmbed.addFields({ name: "Items", value: items });

                await interaction.reply({ embeds: [packEmbed] });
                break;
            // Handle other subcommands...
        }
    },
};
