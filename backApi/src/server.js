// src/server.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const config = require("./config/env");
const connectDB = require("./config/db");

// маршруты
const authRoutes = require("./routes/auth");
const catalogRoutes = require("./routes/catalog");
const promotionsRoutes = require("./routes/promotions");
const ordersRoutes = require("./routes/orders");
const uploadRoutes = require("./routes/upload");
const statsRoutes = require("./routes/stats");
const usersRoutes = require("./routes/users");

// middleware ошибок
const errorMiddleware = require("./middlewares/error");

const app = express();

// Подключаем к MongoDB
connectDB();

// CORS — разрешаем запросы с фронта
app.use(
    cors({
        origin: config.clientUrl,
        credentials: true,
    })
);

// Логирование запросов
app.use(morgan("dev"));

// Парсеры
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Статика для изображений
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health-check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Tokyo Express API is running" });
});

// API-роуты
app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", usersRoutes);

// 404 для несуществующих маршрутов API
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ message: "API route not found" });
    }
    next();
});

// Общий обработчик ошибок
app.use(errorMiddleware);

// Старт сервера
app.listen(config.port, () => {
    console.log(`[SERVER] Running on port ${config.port}`);
});
