const { PermissionsBitField } = require("discord.js");
const {
    findUser,
    createUser,
    updateUser,
    deleteUser,
} = require("../../db/operations");

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

        if (subcommand === "create") {
            const inGameName = interaction.options.getString("ingamename");
            // Check if the user already has an account
            const existingUser = await findUser(interaction.user.id);
            if (existingUser) {
                return interaction.reply("You already have an account.");
            }
            // Create a new user account
            try {
                await createUser(
                    interaction.user.id,
                    interaction.user.username,
                    inGameName
                );
                interaction.reply("Your account has been created.");
            } catch (error) {
                interaction.reply(error.message);
            }
        } else if (subcommand === "edit") {
            // Check if the user has admin permissions
            if (
                !interaction.member.permissions.has(
                    PermissionsBitField.Flags.Administrator
                )
            ) {
                return interaction.reply({
                    content: "You do not have permission to use this command.",
                    ephemeral: true,
                });
            }
            const user = interaction.options.getUser("user");
            const inGameName = interaction.options.getString("ingamename");

            // Use user.id instead of userId
            const existingUser = await findUser(user.id);
            if (!existingUser) {
                return interaction.reply("This user does not exist.");
            }

            try {
                await updateUser(user.id, { inGameName: inGameName });
                interaction.reply(`<@${user.id}>'s account has been updated.`);
            } catch (error) {
                interaction.reply(error.message);
            }
        } else if (subcommand === "delete") {
            // Check if the user has admin permissions
            if (
                !interaction.member.permissions.has(
                    PermissionsBitField.Flags.Administrator
                )
            ) {
                return interaction.reply({
                    content: "You do not have permission to use this command.",
                    ephemeral: true,
                });
            }
            const user = interaction.options.getUser("user");

            // Use user.id instead of userId
            const existingUser = await findUser(user.id);
            if (!existingUser) {
                return interaction.reply("This user does not exist.");
            }
            try {
                await deleteUser(user.id);
                interaction.reply(`<@${user.id}>'s account has been deleted.`);
            } catch (error) {
                interaction.reply(error.message);
            }
        }
    },
};
