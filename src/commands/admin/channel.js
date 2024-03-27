const { PermissionFlagsBits } = require("discord.js");
const dbChannel = require("../../db/channelQueries");

module.exports = {
    name: "channel",
    description: "Set the allowed channels for the /roll command",
    options: [
        {
            name: "add",
            description: "Allow a channel for the /roll command",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "The channel to allow",
                    type: 7,
                    required: true,
                },
            ],
        },
        {
            name: "delete",
            description: "Disallow a channel for the /roll command",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "The channel to disallow",
                    type: 7,
                    required: true,
                },
            ],
        },
        {
            name: "view",
            description: "View all allowed channels",
            type: 1,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel("channel");

        switch (subCommand) {
            case "add":
                try {
                    await dbChannel.saveAllowedChannel(channel.id);
                    await interaction.reply(
                        `The channel <#${channel.id}> has been allowed for the /roll command.`
                    );
                } catch (e) {
                    await interaction.reply({
                        content: e.message,
                        ephemeral: true,
                    });
                }
                break;

            case "delete":
                try {
                    await dbChannel.deleteAllowedChannel(channel.id);
                    await interaction.reply(
                        `The channel <#${channel.id}> has been disallowed for the /roll command.`
                    );
                } catch (e) {
                    await interaction.reply({
                        content: e.message,
                        ephemeral: true,
                    });
                }
                break;

            case "view":
                const allowedChannels = await dbChannel.getAllAllowedChannels();
                try {
                    interaction.reply(
                        `Allowed channels: ${allowedChannels
                            .map((channel) => `<#${channel.channelId}>`)
                            .join(", ")}`
                    );
                } catch (error) {
                    await interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;
        }
    },
};
