const mongoose = require("mongoose");
const { Pack } = require("./packSchema");

const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        name: String,
        image: String,
        rarity: Number,
        pack: { type: mongoose.Schema.Types.ObjectId, ref: "Pack" }, // reference to the pack
    })
);

module.exports = {
    Item,
    createItem: async (itemData) => {
        const { packName, name, image, rarity } = itemData;
        const pack = await Pack.findOne({ type: packName });
        if (!pack) {
            throw new Error(`Pack **${packName}** does not exist.`);
        }

        const existingItem = await Item.findOne({ name });
        if (existingItem) {
            throw new Error(
                `An item with the name **${name}** already exists.`
            );
        }
        const rarityExists = pack.rarity.some((r) => r.level === rarity);
        if (!rarityExists) {
            throw new Error(
                `Rarity level **${rarity}** does not exist in pack **${packName}**.`
            );
        }

        const item = new Item({
            name,
            image,
            rarity,
            pack: pack._id, // reference to the pack
        });

        const savedItem = await item.save();
        pack.items.push(savedItem._id);
        await pack.save();

        return savedItem;
    },

    readItem: async (name) => {
        return await Item.findOne({ name });
    },

    readAllItemsInPack: async (packName) => {
        const pack = await Pack.findOne({ type: packName });
        if (!pack) {
            throw new Error(`Pack **${packName}** does not exist.`);
        }
        const items = await Item.find({ pack: pack._id });
        if (!items.length) {
            throw new Error(`No items found in pack **${packName}**.`);
        }
        return { pack, items };
    },

    updateItem: async (itemName, packName, itemData) => {
        const pack = await Pack.findOne({ type: packName });
        if (!pack) {
            throw new Error(`Pack **${packName}** does not exist.`);
        }

        const item = await Item.findOne({ name: itemName, pack: pack._id });
        if (!item) {
            throw new Error(
                `Item **${itemName}** does not exist in pack **${packName}**.`
            );
        }

        if (itemData.name !== undefined && itemData.name !== null) {
            const nameExists = await Item.findOne({
                name: itemData.name,
                pack: pack._id,
            });
            if (nameExists) {
                throw new Error(
                    `Item name **${itemData.name}** already exists in pack **${packName}**.`
                );
            }
            item.name = itemData.name;
        }

        if (itemData.rarity !== undefined && itemData.rarity !== null) {
            const rarityExists = pack.rarity.some(
                (rarity) => rarity.level === itemData.rarity
            );
            if (!rarityExists) {
                throw new Error(
                    `Rarity level **${itemData.rarity}** does not exist in pack **${packName}**.`
                );
            }
            item.rarity = itemData.rarity;
        }

        // Update the item's properties if the corresponding option was provided

        if (itemData.image !== undefined && itemData.image !== null) {
            item.image = itemData.image;
        }

        return await item.save();
    },

    deleteItem: async (itemName, packName) => {
        const pack = await Pack.findOne({ type: packName });
        if (!pack) {
            throw new Error(`Pack **${packName}** does not exist.`);
        }

        const item = await Item.findOne({ name: itemName, pack: pack._id });
        if (!item) {
            throw new Error(
                `Item **${itemName}** does not exist in pack **${packName}**.`
            );
        }

        // Remove the item from the pack's items array
        pack.items = pack.items.filter((itemId) => !itemId.equals(item._id));
        await pack.save();

        return await Item.deleteOne({ _id: item._id });
    },
};
