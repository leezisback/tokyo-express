// backend/src/controllers/users.controller.js
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Админ: список всех пользователей
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("-passwordHash") // не возвращаем хеш пароля
            .sort({ createdAt: -1 })
            .lean();

        res.json(users);
    } catch (err) {
        next(err);
    }
};

// Админ: получить одного пользователя
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .select("-passwordHash")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
};

// Админ: создать пользователя
exports.createUser = async (req, res, next) => {
    try {
        const { login, password, role, name } = req.body;

        if (!login || !password) {
            return res.status(400).json({ message: "Укажите логин и пароль" });
        }

        // Проверка на существующего пользователя
        const existing = await User.findOne({ login: login.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({ message: "Пользователь с таким логином уже существует" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            login: login.toLowerCase().trim(),
            passwordHash,
            role: role || "admin",
            name: name || "",
        });

        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.status(201).json(userResponse);
    } catch (err) {
        next(err);
    }
};

// Админ: обновить пользователя
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { login, password, role, name } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        if (login) {
            // Проверка на уникальность логина
            const existing = await User.findOne({
                login: login.toLowerCase().trim(),
                _id: { $ne: id },
            });
            if (existing) {
                return res.status(400).json({ message: "Пользователь с таким логином уже существует" });
            }
            user.login = login.toLowerCase().trim();
        }

        if (password) {
            user.passwordHash = await bcrypt.hash(password, 10);
        }

        if (role) {
            user.role = role;
        }

        if (name !== undefined) {
            user.name = name;
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.json(userResponse);
    } catch (err) {
        next(err);
    }
};

// Админ: удалить пользователя
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Нельзя удалить себя
        if (req.user && req.user.id === id) {
            return res.status(400).json({ message: "Нельзя удалить самого себя" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json({ message: "Пользователь удалён" });
    } catch (err) {
        next(err);
    }
};
