const mongoose = require("mongoose");

const AllowedChannel = mongoose.model(
    "AllowedChannel",
    new mongoose.Schema({
        channelId: String,
    })
);

module.exports = {
    AllowedChannel,
    saveAllowedChannel: async (channelId) => {
        const existingChannel = await AllowedChannel.findOne({
            channelId: channelId,
        });
        if (existingChannel) {
            throw new Error(
                `The channel <#${channelId}> is already allowed for the /roll command.`
            );
        }
        const channel = new AllowedChannel({ channelId: channelId });
        return await channel.save();
    },

    deleteAllowedChannel: async (channelId) => {
        const channel = await AllowedChannel.findOne({ channelId: channelId });
        if (!channel) {
            throw new Error(
                `The channel <#${channelId}> is not allowed for the /roll command.`
            );
        }
        return await AllowedChannel.deleteOne({ channelId: channelId });
    },

    getAllAllowedChannels: async () => {
        const channels = await AllowedChannel.find({});
        if (channels.length === 0) {
            throw new Error(`No allowed channels found.`);
        }
        return channels;
    },
};
