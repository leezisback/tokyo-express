// src/routes/auth.js
const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ route: "auth", status: "ok" });
});

module.exports = router;
