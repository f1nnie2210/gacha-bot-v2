const mongoose = require("mongoose");

const AllowedChannel = mongoose.model(
    "AllowedChannel",
    new mongoose.Schema({
        channelId: String,
    })
);

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        discordId: String,
        name: String,
        inGameName: String,
        points: { type: Number, default: 0 },
    })
);

const Pack = mongoose.model(
    "Pack",
    new mongoose.Schema({
        type: { type: String, index: true },
        points: { type: Number, required: true },
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        rarity: [
            {
                level: Number,
                rollRate: { type: Number, min: 0, max: 100 },
            },
        ],
    })
);

const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        name: String,
        image: String,
        rarity: Number,
        pack: { type: mongoose.Schema.Types.ObjectId, ref: "Pack" },
    })
);

const RollResult = mongoose.model(
    "RollResult",
    new mongoose.Schema({
        userId: String,
        inGameName: String,
        results: [
            {
                itemName: String,
                time: { type: Date, default: Date.now },
            },
        ],
    })
);

module.exports = {
    AllowedChannel,
    User,
    Pack,
    Item,
    RollResult,
};
