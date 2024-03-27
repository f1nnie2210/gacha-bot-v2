const {
    pagination,
    ButtonTypes,
    ButtonStyles,
} = require("@devraelfreeze/discordjs-pagination");
const { EmbedBuilder } = require("discord.js");
const { RollResult } = require("../../db/schema/schema");

module.exports = {
    name: "rollresults",
    description: "Show roll results",
    callback: async (client, interaction) => {
        try {
            const rollResults = await RollResult.find({
                userId: interaction.user.id,
            });

            // Group results into chunks of 10
            const chunks = [];
            for (let i = 0; i < rollResults.length; i += 10) {
                chunks.push(rollResults.slice(i, i + 10));
            }

            const arrayEmbeds = chunks.map((chunk, index) => {
                const embed = new EmbedBuilder()
                    .setTitle(`Page ${index + 1}`)
                    .setDescription(
                        chunk
                            .flatMap((rollResult, i) =>
                                rollResult.results.map(
                                    (result, j) =>
                                        `${i * 10 + j + 1}. ${
                                            result.itemName
                                        } at ${new Date(
                                            result.time
                                        ).toLocaleString()}`
                                )
                            )
                            .join("\n")
                    )
                    .setColor(0x0099ff);
                return embed;
            });

            await pagination({
                embeds: arrayEmbeds,
                author: interaction.member.user,
                interaction: interaction,
                time: 80000,
                disableButtons: false,
                fastSkip: false,
                pageTravel: true,
                buttons: [
                    {
                        type: ButtonTypes.previous,
                        label: "Previous Page",
                        style: ButtonStyles.Primary,
                    },
                    {
                        type: ButtonTypes.next,
                        label: "Next Page",
                        style: ButtonStyles.Success,
                    },
                ],
            });
        } catch (error) {
            await interaction.reply({
                content: error.message,
                ephemeral: true,
            });
        }
    },
};
