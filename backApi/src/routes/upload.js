// src/routes/upload.js
const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ route: "upload", status: "ok" });
});

module.exports = router;
