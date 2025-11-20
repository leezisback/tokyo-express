// backend/src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const config = require("../config/env");

function auth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ")
            ? header.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({ message: "Не авторизовано" });
        }

        const payload = jwt.verify(token, config.jwtSecret);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Токен недействителен или истёк" });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || !["admin", "manager"].includes(req.user.role)) {
        return res.status(403).json({ message: "Недостаточно прав" });
    }
    next();
}

module.exports = {
    auth,
    requireAdmin,
};
