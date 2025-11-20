// backend/src/controllers/orders.controller.js
const Order = require("../models/Order");
const calcTotal = require("../utils/calcTotal");
const Promotion = require("../models/Promotion");

async function getActiveOrderPromotion() {
    const now = new Date();

    const promotion = await Promotion.findOne({
        isActive: true,
        discountPercent: { $gt: 0 },
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

    return promotion;
}

// Публичный: создание заказа
exports.createOrder = async (req, res, next) => {
    try {
        const { items, mode, address, phone, comment } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Корзина пуста" });
        }

        if (!mode || !["delivery", "pickup"].includes(mode)) {
            return res.status(400).json({ message: "Неверный режим заказа" });
        }

        if (!phone) {
            return res.status(400).json({ message: "Укажите телефон" });
        }

        const normalizedItems = items.map(item => ({
            product: item.product,
            name: item.name,
            price: item.price,
            qty: item.qty,
        }));

        const deliveryPrice = mode === "delivery" ? 150 : 0;

        const activePromotion = await getActiveOrderPromotion();

        const discountPercent =
            activePromotion && activePromotion.minOrderTotal
                ? undefined
                : activePromotion?.discountPercent || 0;

        // сначала считаем без скидки, чтобы проверить minOrderTotal
        const draft = calcTotal(
            normalizedItems.map(i => ({ price: i.price, qty: i.qty })),
            deliveryPrice,
            0
        );

        let finalDiscountPercent = 0;

        if (activePromotion && activePromotion.discountPercent > 0) {
            if (!activePromotion.minOrderTotal || draft.subtotal >= activePromotion.minOrderTotal) {
                finalDiscountPercent = activePromotion.discountPercent;
            }
        }

        const totals = calcTotal(
            normalizedItems.map(i => ({ price: i.price, qty: i.qty })),
            deliveryPrice,
            finalDiscountPercent
        );

        const order = await Order.create({
            items: normalizedItems,
            subtotal: totals.subtotal,
            deliveryPrice: totals.deliveryPrice,
            total: totals.total,
            mode,
            address: mode === "delivery" ? address || {} : {},
            phone,
            comment: comment || "",
            status: "new",
        });

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

// Админ: список заказов
exports.getOrders = async (req, res, next) => {
    try {
        const { status, mode } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (mode) {
            filter.mode = mode;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// Админ: один заказ
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

// Админ: смена статуса
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "new",
            "accepted",
            "cooking",
            "to_courier",
            "on_way",
            "done",
            "canceled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Неверный статус" });
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
