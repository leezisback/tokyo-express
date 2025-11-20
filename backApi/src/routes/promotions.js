// src/routes/promotions.js
const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ route: "promotions", status: "ok" });
});

module.exports = router;
