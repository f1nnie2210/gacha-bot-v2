const dbUser = require("../../db/userSchema");

module.exports = {
    name: "pointsview",
    description: "View your points",

    callback: async (client, interaction) => {
        const user = interaction.user;
        const points = await dbUser.findUser(user.id);

        if (!points) {
            return interaction.reply("User not found.");
        }
        interaction.reply(
            `**${user.username}** has **${points.points}** points.`
        );
    },
};
