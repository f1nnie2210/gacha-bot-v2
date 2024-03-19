const { PermissionFlagsBits } = require("discord.js");
const {
    saveAllowedChannel,
    deleteAllowedChannel,
    getAllAllowedChannels,
} = require("../../db/operations");

module.exports = {
    name: "settings",
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

        switch (subCommand) {
            case "add":
                const channelToAdd = interaction.options.getChannel("channel");
                // Get all allowed channels from your database
                const allowedChannelsForAdd = await getAllAllowedChannels();
                // Check if the channel is already allowed
                if (
                    allowedChannelsForAdd.some(
                        (allowedChannel) =>
                            allowedChannel.channelId === channelToAdd.id
                    )
                ) {
                    return interaction.reply(
                        `The channel <#${channelToAdd.id}> is already allowed for the /roll command.`
                    );
                }

                // Save the channel ID to your database
                await saveAllowedChannel(channelToAdd.id);
                interaction.reply(
                    `The channel <#${channelToAdd.id}> has been allowed for the /roll command.`
                );
                break;

            case "delete":
                const channelToDelete =
                    interaction.options.getChannel("channel");
                // Get all allowed channels from your database
                const allowedChannelsForDelete = await getAllAllowedChannels();
                // Check if the channel is not allowed
                if (
                    !allowedChannelsForDelete.some(
                        (allowedChannel) =>
                            allowedChannel.channelId === channelToDelete.id
                    )
                ) {
                    return interaction.reply(
                        `The channel <#${channelToDelete.id}> is not allowed for the /roll command.`
                    );
                }

                // Delete the channel ID from your database
                await deleteAllowedChannel(channelToDelete.id);
                interaction.reply(
                    `The channel <#${channelToDelete.id}> has been disallowed for the /roll command.`
                );
                break;

            case "view":
                // Get all allowed channels from your database
                const allowedChannels = await getAllAllowedChannels();
                interaction.reply(
                    `Allowed channels: ${allowedChannels
                        .map((channel) => `<#${channel.channelId}>`)
                        .join(", ")}`
                );
                break;
        }
    },
};
