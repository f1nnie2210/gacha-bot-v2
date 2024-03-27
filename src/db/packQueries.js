const mongoose = require("mongoose");
const { Pack } = require("./schema/schema.js");

module.exports = {
    createPack: async (packData) => {
        const existingPack = await Pack.findOne({ type: packData.type });
        if (existingPack) {
            throw new Error(
                `A pack with the name ${packData.type} already exists.`
            );
        }

        const createRarity = Array.from({ length: 10 }, (_, i) => {
            const rollRate = packData.rarity[i];
            return { level: i + 1, rollRate: rollRate || 0 };
        }).filter(({ rollRate }) => rollRate > 0);

        const totalRollRate = createRarity.reduce(
            (total, { rollRate }) => total + rollRate,
            0
        );

        if (totalRollRate > 100) {
            throw new Error(
                `The total roll rate cannot exceed 100%. Your input was ${totalRollRate}%.`
            );
        }

        const newPack = {
            type: packData.type,
            points: packData.points,
            rarity: createRarity,
        };

        return await new Pack(newPack).save();
    },

    viewPack: async () => {
        const packs = await Pack.find().populate("items");

        if (!packs.length) {
            throw new Error(`No packs found.`);
        }
        return { packs };
    },

    editPack: async (type, newName, points, rarityOptions) => {
        const editPack = await Pack.findOne({ type: type });
        if (!editPack) {
            throw new Error(`Pack ${type} does not exist.`);
        }

        if (newName) {
            const existingPack = await Pack.findOne({ type: newName });
            if (existingPack) {
                throw new Error(
                    `A pack with the name ${newName} already exists.`
                );
            }
            editPack.type = newName;
        }

        if (points !== null) {
            editPack.points = points;
        }

        const existingRarity = new Map(
            editPack.rarity.map((r) => [r.level, r.rollRate])
        );
        const editRarity = Array.from({ length: 10 }, (_, i) => {
            const rollRate = rarityOptions[i];
            if (rollRate === 0) {
                return null;
            }
            return rollRate !== null
                ? { level: i + 1, rollRate }
                : existingRarity.has(i + 1)
                ? { level: i + 1, rollRate: existingRarity.get(i + 1) }
                : null;
        }).filter(Boolean);

        const totalRollRate = editRarity.reduce(
            (total, r) => total + r.rollRate,
            0
        );

        if (totalRollRate > 100) {
            throw new Error("The total roll rate cannot exceed 100%.");
        }

        editPack.rarity = editRarity;
        await editPack.save();

        return editPack;
    },

    deletePack: async (type) => {
        const pack = await Pack.findOne({ type });
        if (!pack) {
            throw new Error(`Pack ${type} does not exist.`);
        }

        // Remove all items associated with the pack
        await Item.deleteMany({ pack: pack._id });

        // Delete the pack
        return await Pack.deleteOne({ type });
    },
};
