// src/routes/orders.js
const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ route: "orders", status: "ok" });
});

module.exports = router;
