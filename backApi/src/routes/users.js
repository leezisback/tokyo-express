// backend/src/routes/users.js
const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const { auth, requireAdmin } = require("../middlewares/auth");

// Все операции доступны только админу
router.get("/", auth, requireAdmin, usersController.getAllUsers);
router.get("/:id", auth, requireAdmin, usersController.getUserById);
router.post("/", auth, requireAdmin, usersController.createUser);
router.put("/:id", auth, requireAdmin, usersController.updateUser);
router.delete("/:id", auth, requireAdmin, usersController.deleteUser);

module.exports = router;
