// backend/src/routes/promotions.js
const express = require("express");
const router = express.Router();

const promotionsController = require("../controllers/promotions.controller");
const { auth, requireAdmin } = require("../middlewares/auth");

// Публичный список активных акций
router.get("/", promotionsController.getActivePromotions);

// Админ-маршруты
router.get("/all", auth, requireAdmin, promotionsController.getAllPromotions);
router.post("/", auth, requireAdmin, promotionsController.createPromotion);
router.put("/:id", auth, requireAdmin, promotionsController.updatePromotion);
router.delete("/:id", auth, requireAdmin, promotionsController.deletePromotion);

module.exports = router;
