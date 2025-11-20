// backend/src/controllers/products.controller.js
const Product = require("../models/Product");

// Публичный список товаров
exports.getProducts = async (req, res, next) => {
    try {
        const { category, search, isPromotion } = req.query;

        const filter = { isAvailable: true };

        if (category) {
            filter.category = category; // сюда можно передавать ObjectId строки
        }

        if (typeof isPromotion !== "undefined") {
            filter.isPromotion = isPromotion === "true";
        }

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const products = await Product.find(filter)
            .populate("category", "name slug")
            .sort({ position: 1, name: 1 })
            .lean();

        res.json(products);
    } catch (err) {
        next(err);
    }
};

// Публичный: один товар (на будущее)
exports.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("category", "name slug")
            .lean();

        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};

// Админ: создание товара
exports.createProduct = async (req, res, next) => {
    try {
        const {
            name,
            slug,
            category,
            description,
            composition,
            weight,
            price,
            image,
            isAvailable,
            isPromotion,
            discountPercent,
            position,
        } = req.body;

        const product = await Product.create({
            name,
            slug,
            category,
            description,
            composition,
            weight,
            price,
            image: image || "",
            isAvailable: isAvailable ?? true,
            isPromotion: isPromotion ?? false,
            discountPercent: discountPercent ?? 0,
            position: position ?? 0,
        });

        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

// Админ: обновление товара
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            name,
            slug,
            category,
            description,
            composition,
            weight,
            price,
            image,
            isAvailable,
            isPromotion,
            discountPercent,
            position,
        } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            {
                name,
                slug,
                category,
                description,
                composition,
                weight,
                price,
                image,
                isAvailable,
                isPromotion,
                discountPercent,
                position,
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};

// Админ: удаление товара
exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        res.json({ message: "Товар удалён" });
    } catch (err) {
        next(err);
    }
};
