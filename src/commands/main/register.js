const dbUser = require("../../db/userSchema");

module.exports = {
    name: "register",
    description: "Register an account",
    options: [
        {
            name: "ingamename",
            type: 3,
            description: "Your in-game name",
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        const inGameName = interaction.options.getString("ingamename");

        try {
            await dbUser.createUser(
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
    },
};
