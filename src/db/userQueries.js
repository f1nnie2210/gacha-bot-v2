const { User } = require("./schema/schema.js");
const { RollResult } = require("./schema/schema");
const nameRegex = /^[a-zA-Z]+(_[a-zA-Z]+)*$/;

module.exports = {
    findUser: async (discordId) => {
        return await User.findOne({ discordId: discordId });
    },

    createUser: async (discordId, name, inGameName) => {
        // Check if the user already has an account
        const existingDiscordUser = await User.findOne({
            discordId: discordId,
        });
        if (existingDiscordUser) {
            throw new Error("This user already has an account.");
        }

        // Check if the inGameName is already in use
        if (!nameRegex.test(inGameName)) {
            throw new Error(
                "Invalid in-game name. It should be in the form of 'name_name'."
            );
        }
        const existingUser = await User.findOne({
            inGameName: { $regex: new RegExp(`^${inGameName}$`, "i") },
        });
        if (existingUser) {
            throw new Error("This in-game name is already in use.");
        }

        const user = new User({
            discordId: discordId,
            name: name,
            inGameName: inGameName,
            points: 0,
        });
        return await user.save();
    },

    updateUser: async (discordId, updates) => {
        // Check if the user exists
        const user = await User.findOne({ discordId: discordId });
        if (!user) {
            throw new Error(
                `The user with discordId **${discordId}** does not exist.`
            );
        }

        // Check if the inGameName is valid and not in use
        if (updates.inGameName && !nameRegex.test(updates.inGameName)) {
            throw new Error(
                "Invalid in-game name. It should be in the form of 'name_name'."
            );
        }
        if (updates.inGameName) {
            const existingUser = await User.findOne({
                inGameName: {
                    $regex: new RegExp(`^${updates.inGameName}$`, "i"),
                },
            });
            if (existingUser && existingUser.discordId !== discordId) {
                throw new Error("This in-game name is already in use.");
            }
        }

        // Update the user
        Object.assign(user, updates);
        await user.save();

        if (updates.inGameName) {
            await RollResult.updateMany(
                { userId: discordId },
                { $set: { inGameName: updates.inGameName } }
            );
        }

        return user;
    },

    deleteUser: async (discordId) => {
        const user = await User.findOne({ discordId: discordId });
        if (!user) {
            throw new Error(
                `The user with discordId ${discordId} does not exist.`
            );
        }
        return await User.deleteOne({ discordId: discordId });
    },

    addPoints: async (discordId, pointsToAdd) => {
        const user = await User.findOne({ discordId: discordId });
        if (!user) {
            throw new Error(`User does not exist.`);
        }
        user.points += pointsToAdd;
        return await user.save();
    },

    setPoints: async (discordId, pointsToSet) => {
        const user = await User.findOne({ discordId: discordId });
        if (!user) {
            throw new Error(`User does not exist.`);
        }
        user.points = pointsToSet;
        return await user.save();
    },

    takePoints: async (discordId, pointsToTake) => {
        const user = await User.findOne({ discordId: discordId });
        if (!user) {
            throw new Error(`User with does not exist.`);
        }
        if (user.points < pointsToTake) {
            throw new Error(`The user does not have enough points.`);
        }
        user.points -= pointsToTake;
        return await user.save();
    },

    checkPoints: async (discordId) => {
        const user = await User.findOne({ discordId: discordId });
        if (!user) {
            throw new Error(`User does not exist.`);
        }
        return user.points;
    },
};
