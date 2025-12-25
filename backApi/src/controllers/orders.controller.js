// backend/src/controllers/orders.controller.js
const Order = require("../models/Order");
const calcTotal = require("../utils/calcTotal"); // ← тут именно без {}

exports.createOrder = async (req, res, next) => {
    try {
        const { items, mode, address, phone, comment } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Корзина пуста" });
        }

        if (!phone) {
            return res.status(400).json({ message: "Укажите номер телефона" });
        }

        const deliveryMode = mode === "pickup" ? "pickup" : "delivery";
        const subtotal = calcTotal(items);
        const deliveryPrice = deliveryMode === "pickup" ? 0 : 150; // можно вынести в config
        const total = subtotal + deliveryPrice;

        const order = await Order.create({
            items,
            subtotal,
            deliveryPrice,
            total,
            mode: deliveryMode,
            address: address || {},
            phone,
            comment: comment || "",
        });

        return res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .lean();

        res.json(orders);
    } catch (err) {
        next(err);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).lean();

        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = [
            "new",
            "accepted",
            "cooking",
            "to_courier",
            "on_way",
            "done",
            "canceled",
        ];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Некорректный статус" });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
};

exports.updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { items, address, phone, comment } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        // Обновляем поля, если они переданы
        if (items && Array.isArray(items)) {
            order.items = items;
            const subtotal = calcTotal(items);
            order.subtotal = subtotal;
            order.total = subtotal + (order.deliveryPrice || 0);
        }

        if (address) {
            order.address = { ...order.address, ...address };
        }

        if (phone) {
            order.phone = phone;
        }

        if (comment !== undefined) {
            order.comment = comment;
        }

        await order.save();

        res.json(order);
    } catch (err) {
        next(err);
    }
};
