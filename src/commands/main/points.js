const dbOperations = require("../../db/operations");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "points",
    description: "Manage user points",
    options: [
        {
            name: "add",
            type: 1, // 'SUB_COMMAND' is represented by 1
            description: "Add points to a user",
            options: [
                {
                    name: "user",
                    type: 6, // 'USER' is represented by 6
                    description: "The user to add points to",
                    required: true,
                },
                {
                    name: "points",
                    type: 4, // 'INTEGER' is represented by 4
                    description: "The number of points to add",
                    required: true,
                },
            ],
        },
        {
            name: "set",
            type: 1,
            description: "Set a user's points",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "The user to set points for",
                    required: true,
                },
                {
                    name: "points",
                    type: 4,
                    description: "The number of points to set",
                    required: true,
                },
            ],
        },
        {
            name: "take",
            type: 1,
            description: "Subtract points from a user",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "The user to subtract points from",
                    required: true,
                },
                {
                    name: "points",
                    type: 4,
                    description: "The number of points to subtract",
                    required: true,
                },
            ],
        },
        {
            name: "view",
            type: 1,
            description: "View a user's points",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "The user to view points for",
                    required: false,
                },
            ],
        },
    ],
    callback: async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const points = interaction.options.getInteger("points");
        if (
            ["add", "set", "take"].includes(subCommand) &&
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator
            )
        ) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }
        switch (subCommand) {
            case "add":
                const userToAddPoints = await dbOperations.findUser(user.id);
                if (!userToAddPoints) {
                    return interaction.reply("User not found.");
                }
                await dbOperations.updateUser(user.id, {
                    points: userToAddPoints.points + points,
                });
                interaction.reply(
                    `Added ${points} points to ${user.username}.`
                );
                break;
            case "set":
                await dbOperations.updateUser(user.id, { points: points });
                interaction.reply(
                    `Set ${user.username}'s points to ${points}.`
                );
                break;
            case "take":
                const userToTakePoints = await dbOperations.findUser(user.id);
                if (!userToTakePoints) {
                    return interaction.reply("User not found.");
                }
                if (points > userToTakePoints.points) {
                    return interaction.reply(
                        "Cannot take more points than the user has."
                    );
                }
                await dbOperations.updateUser(user.id, {
                    points: userToTakePoints.points - points,
                });
                interaction.reply(
                    `Subtracted ${points} points from ${user.username}.`
                );
                break;
            case "view":
                const userToView =
                    interaction.options.getUser("user") || interaction.user;
                if (
                    !interaction.member.permissions.has(
                        PermissionsBitField.Flags.Administrator
                    ) &&
                    userToView.id !== interaction.user.id
                ) {
                    return interaction.reply({
                        content:
                            "You don't have permission to view other users' points.",
                        ephemeral: true,
                    });
                }
                const userPoints = await dbOperations.findUser(userToView.id);
                if (!userPoints) {
                    return interaction.reply("User not found.");
                }
                interaction.reply(
                    `${userToView.username} has ${userPoints.points} points.`
                );
                break;
        }
    },
};
