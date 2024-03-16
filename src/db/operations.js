const mongoose = require("mongoose");

// Define the User model
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        discordId: String,
        name: String,
        inGameName: String,
        points: Number,
    })
);
const AllowedChannel = mongoose.model(
    "AllowedChannel",
    new mongoose.Schema({
        channelId: String,
    })
);
const nameRegex = /^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/;

module.exports = {
    findUser: async (discordId) => {
        return await User.findOne({ discordId: discordId });
    },
    createUser: async (discordId, name, inGameName) => {
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
        return await User.updateOne({ discordId: discordId }, updates);
    },
    deleteUser: async (discordId) => {
        return await User.deleteOne({ discordId: discordId });
    },

    saveAllowedChannel: async (channelId) => {
        const channel = new AllowedChannel({ channelId: channelId });
        return await channel.save();
    },

    deleteAllowedChannel: async (channelId) => {
        return await AllowedChannel.deleteOne({ channelId: channelId });
    },
    getAllAllowedChannels: async () => {
        return await AllowedChannel.find({});
    },
};
