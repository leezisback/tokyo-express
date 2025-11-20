// backend/src/controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/env");

exports.login = async (req, res, next) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ message: "Укажите логин и пароль" });
        }

        const user = await User.findOne({ login: login.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }

        const payload = {
            id: user._id,
            login: user.login,
            role: user.role,
        };

        const token = jwt.sign(payload, config.jwtSecret, {
            expiresIn: "7d",
        });

        return res.json({
            token,
            user: {
                id: user._id,
                login: user.login,
                role: user.role,
                name: user.name,
            },
        });
    } catch (err) {
        next(err);
    }
};
