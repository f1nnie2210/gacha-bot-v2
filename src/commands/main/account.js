const { PermissionsBitField } = require("discord.js");
const dbOperations = require("../../db/operations");

module.exports = {
    name: "account",
    description: "Manage user accounts",
    options: [
        {
            name: "create",
            type: 1, // 'SUB_COMMAND' is represented by 1
            description: "Create a new user account",
            options: [
                {
                    name: "ingamename",
                    type: 3,
                    description: "Your in-game name",
                    required: true,
                },
            ],
        },
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
    callback: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        if (
            ["delete", "edit"].includes(subcommand) &&
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator
            )
        ) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }
        switch (subcommand) {
            case "create":
                const inGameName = interaction.options.getString("ingamename");
                const existingUser = await dbOperations.findUser(
                    interaction.user.id
                );
                if (existingUser) {
                    return interaction.reply("You already have an account.");
                }
                try {
                    await dbOperations.createUser(
                        interaction.user.id,
                        interaction.user.username,
                        inGameName
                    );
                    interaction.reply("Your account has been created.");
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;
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
