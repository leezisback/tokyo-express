const dotenv = require("dotenv");
const path = require("path");

// Загружаем .env из корня backend
dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || "dev_secret",
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

if (!config.mongoUri) {
    console.warn("[ENV] MONGO_URI не задан в .env");
}

module.exports = config;
