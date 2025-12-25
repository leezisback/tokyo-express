// backend/src/routes/orders.js
const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/orders.controller");
const { auth, requireAdmin } = require("../middlewares/auth");

// Публичный маршрут: создание заказа
router.post("/", ordersController.createOrder);

// Админ: просмотр/управление заказами
router.get("/", auth, requireAdmin, ordersController.getOrders);
router.get("/:id", auth, requireAdmin, ordersController.getOrderById);
router.patch("/:id/status", auth, requireAdmin, ordersController.updateOrderStatus);
router.patch("/:id", auth, requireAdmin, ordersController.updateOrder);
router.delete("/:id", auth, requireAdmin, ordersController.deleteOrder);

module.exports = router;
