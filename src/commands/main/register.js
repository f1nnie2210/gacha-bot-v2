const dbOperations = require("../../db/operations");

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
        const existingUser = await dbOperations.findUser(interaction.user.id);
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
    },
};
