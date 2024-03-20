const dbOperations = require("../../db/operations");
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

        switch (subcommand) {
            case "edit":
                try {
                    const userToEdit = interaction.options.getUser("user");
                    const newInGameName =
                        interaction.options.getString("ingamename");
                    await dbOperations.updateUser(userToEdit.id, {
                        inGameName: newInGameName,
                    });
                    interaction.reply(
                        `In-game name of ${userToEdit.username} has been updated to ${newInGameName}.`
                    );
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;
            case "delete":
                const userToDelete = interaction.options.getUser("user");
                const userToDeleteExists = await dbOperations.findUser(
                    userToDelete.id
                );
                if (!userToDeleteExists) {
                    return interaction.reply("This user does not exist.");
                }
                try {
                    await dbOperations.deleteUser(userToDelete.id);
                    interaction.reply(
                        `<@${userToDelete.id}>'s account has been deleted.`
                    );
                } catch (error) {
                    interaction.reply(error.message);
                }
                break;
        }
    },
};
