// src/routes/catalog.js
const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ route: "catalog", status: "ok" });
});

module.exports = router;
