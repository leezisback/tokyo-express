// backend/src/controllers/categories.controller.js
const Category = require("../models/Category");

// Публичный список категорий для витрины
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ position: 1, name: 1 })
            .lean();

        res.json(categories);
    } catch (err) {
        next(err);
    }
};

// Админ: создание категории
exports.createCategory = async (req, res, next) => {
    try {
        const { name, slug, parent, position, isActive } = req.body;

        const category = await Category.create({
            name,
            slug,
            parent: parent || null,
            position: position ?? 0,
            isActive: isActive ?? true,
        });

        res.status(201).json(category);
    } catch (err) {
        next(err);
    }
};

// Админ: обновление категории
exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, slug, parent, position, isActive } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            {
                name,
                slug,
                parent: parent || null,
                position,
                isActive,
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Категория не найдена" });
        }

        res.json(category);
    } catch (err) {
        next(err);
    }
};

// Админ: удаление категории
exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Категория не найдена" });
        }

        res.json({ message: "Категория удалена" });
    } catch (err) {
        next(err);
    }
};
