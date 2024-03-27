const dbUser = require("../../db/userQueries");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "account",
    description: "Manage user accounts",
    options: [
        {
            name: "edit",
            type: 1,
            description: "Edit a user account",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "The user to edit",
                    required: true,
                },
                {
                    name: "ingamename",
                    type: 3,
                    description: "The new in-game name",
                    required: true,
                },
            ],
        },
        {
            name: "delete",
            type: 1,
            description: "Delete a user account",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "The user to delete",
                    required: true,
                },
            ],
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const newInGameName = interaction.options.getString("ingamename");

        switch (subcommand) {
            case "edit":
                try {
                    await dbUser.updateUser(user.id, {
                        inGameName: newInGameName,
                    });
                    interaction.reply(
                        `In-game name of ${user.username} has been updated to ${newInGameName}.`
                    );
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "delete":
                try {
                    await dbUser.deleteUser(user.id);
                    interaction.reply(
                        `<@${user.id}>'s account has been deleted.`
                    );
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;
        }
    },
};
