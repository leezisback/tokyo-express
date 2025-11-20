// backend/src/routes/catalog.js
const express = require("express");
const router = express.Router();

const categoriesController = require("../controllers/categories.controller");
const productsController = require("../controllers/products.controller");
const { auth, requireAdmin } = require("../middlewares/auth");

// Публичные маршруты
router.get("/categories", categoriesController.getCategories);
router.get("/products", productsController.getProducts);
router.get("/products/:id", productsController.getProductById);

// Админ: категории
router.post("/categories", auth, requireAdmin, categoriesController.createCategory);
router.put("/categories/:id", auth, requireAdmin, categoriesController.updateCategory);
router.delete("/categories/:id", auth, requireAdmin, categoriesController.deleteCategory);

// Админ: товары
router.post("/products", auth, requireAdmin, productsController.createProduct);
router.put("/products/:id", auth, requireAdmin, productsController.updateProduct);
router.delete("/products/:id", auth, requireAdmin, productsController.deleteProduct);

module.exports = router;
