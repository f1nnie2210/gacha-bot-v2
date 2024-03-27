const { Item, RollResult } = require("../db/schema/schema");

module.exports = {
    async rollItem(pack, user) {
        // Calculate the total roll rate
        const totalRollRate = pack.rarity.reduce(
            (total, rarity) => total + rarity.rollRate,
            0
        );

        // Generate a random number within the range of the total roll rate
        let randomNumber = Math.random() * totalRollRate;

        // Sort the rarity levels in descending order
        const sortedRarity = [...pack.rarity].sort((a, b) => b.level - a.level);

        // Iterate over the rarity levels
        for (const rarity of sortedRarity) {
            // Subtract the roll rate of the current rarity level from the random number
            randomNumber -= rarity.rollRate;

            // If the result is less than or equal to zero, select an item of the current rarity level
            if (randomNumber <= 0) {
                const itemsOfRarity = await Item.find({
                    pack: pack._id,
                    rarity: rarity.level,
                });
                const item =
                    itemsOfRarity[
                        Math.floor(Math.random() * itemsOfRarity.length)
                    ];

                const rollResult = await RollResult.findOneAndUpdate(
                    { userId: user.discordId },
                    {
                        $push: {
                            results: {
                                itemName: item.name,
                            },
                        },
                        $setOnInsert: { inGameName: user.inGameName },
                    },
                    { upsert: true, new: true }
                );
                return item;
            }
        }
    },
};
