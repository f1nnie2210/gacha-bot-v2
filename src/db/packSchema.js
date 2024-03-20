const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: String,
    image: String,
    rarity: Number,
    pack: { type: mongoose.Schema.Types.ObjectId, ref: "Pack" }, // reference to the pack
});

const packSchema = new mongoose.Schema({
    type: { type: String, index: true },
    points: { type: Number, required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }], // array of references to items
    rarity: [
        {
            level: Number,
            rollRate: { type: Number, min: 0, max: 100 },
        },
    ],
});

module.exports = {
    Pack: mongoose.model("Pack", packSchema),
    Item: mongoose.model("Item", itemSchema),
};
