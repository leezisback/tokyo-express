// backend/src/controllers/promotions.controller.js
const Promotion = require("../models/Promotion");

// Публичные акции (только активные)
exports.getActivePromotions = async (req, res, next) => {
    try {
        const now = new Date();

        const promotions = await Promotion.find({
            isActive: true,
            $or: [
                { activeFrom: null, activeTo: null },
                {
                    activeFrom: { $lte: now },
                    activeTo: { $gte: now },
                },
                {
                    activeFrom: { $lte: now },
                    activeTo: null,
                },
            ],
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json(promotions);
    } catch (err) {
        next(err);
    }
};

// Админ: список всех акций
exports.getAllPromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 }).lean();
        res.json(promotions);
    } catch (err) {
        next(err);
    }
};

// Админ: создать акцию
exports.createPromotion = async (req, res, next) => {
    try {
        const { title, description, discountPercent, minOrderTotal, activeFrom, activeTo, isActive } =
            req.body;

        const promotion = await Promotion.create({
            title,
            description,
            discountPercent: discountPercent ?? 0,
            minOrderTotal: minOrderTotal ?? 0,
            activeFrom: activeFrom || null,
            activeTo: activeTo || null,
            isActive: isActive ?? true,
        });

        res.status(201).json(promotion);
    } catch (err) {
        next(err);
    }
};

// Админ: обновить акцию
exports.updatePromotion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, discountPercent, minOrderTotal, activeFrom, activeTo, isActive } =
            req.body;

        const promotion = await Promotion.findByIdAndUpdate(
            id,
            {
                title,
                description,
                discountPercent,
                minOrderTotal,
                activeFrom,
                activeTo,
                isActive,
            },
            { new: true }
        );

        if (!promotion) {
            return res.status(404).json({ message: "Акция не найдена" });
        }

        res.json(promotion);
    } catch (err) {
        next(err);
    }
};

// Админ: удалить акцию
exports.deletePromotion = async (req, res, next) => {
    try {
        const { id } = req.params;

        const promotion = await Promotion.findByIdAndDelete(id);
        if (!promotion) {
            return res.status(404).json({ message: "Акция не найдена" });
        }

        res.json({ message: "Акция удалена" });
    } catch (err) {
        next(err);
    }
};
