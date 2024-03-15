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

module.exports = {
    findUser: async (discordId) => {
        return await User.findOne({ discordId: discordId });
    },

    createUser: async (discordId, name, inGameName) => {
        // Check if the inGameName is already in use
        const existingUser = await User.findOne({ inGameName: inGameName });
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
        return await User.updateOne({ discordId: discordId }, updates);
    },

    deleteUser: async (discordId) => {
        return await User.deleteOne({ discordId: discordId });
    },
};