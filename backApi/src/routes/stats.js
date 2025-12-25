// backend/src/routes/stats.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { auth, requireAdmin } = require("../middlewares/auth");

// Получить статистику за сегодня
router.get("/today", auth, requireAdmin, async (req, res, next) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "canceled" },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const ordersCount = orders.length;
        const avgCheck = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

        // Активные заказы (в работе, на доставке)
        const activeOrders = await Order.find({
            status: { $in: ["new", "accepted", "cooking", "to_courier", "on_way"] },
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.json({
            today: {
                revenue: totalRevenue,
                ordersCount,
                avgCheck,
            },
            activeOrders: activeOrders.map((o) => ({
                ...o,
                id: o._id,
            })),
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
