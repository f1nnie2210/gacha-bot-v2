const dbUser = require("../../db/userSchema");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "points",
    description: "Manage user points",
    options: [
        {
            name: "add",
            type: 1, // 'SUB_COMMAND'
            description: "Add points to a user",
            options: [
                {
                    name: "user",
                    type: 6, // 'USER'
                    description: "The user to add points to",
                    required: true,
                },
                {
                    name: "points",
                    type: 4, // 'INTEGER'
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
            name: "check",
            type: 1,
            description: "View a user's points",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "The user to view points for",
                    required: true,
                },
            ],
        },
    ],

    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const points = interaction.options.getInteger("points");

        switch (subCommand) {
            case "add":
                try {
                    await dbUser.addPoints(user.id, points);
                    interaction.reply(
                        `Added **${points}** points to **${user.username}**.`
                    );
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "set":
                try {
                    await dbUser.setPoints(user.id, points);
                    interaction.reply(
                        `Set **${user.username}'s** points to **${points}**.`
                    );
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "take":
                try {
                    await dbUser.takePoints(user.id, points);
                    interaction.reply(
                        `Took ${points} points from ${user.username}.`
                    );
                } catch (error) {
                    interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
                break;

            case "check":
                try {
                    const points = await dbUser.checkPoints(user.id);
                    interaction.reply(
                        `**${user.username}** has **${points}** points.`
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
