const mongoose = require("mongoose");
const config = require("./env");

async function connectDB() {
    try {
        await mongoose.connect(config.mongoUri, {
            // Опции можно не указывать в новых версиях mongoose
        });
        console.log("[DB] MongoDB connected");
    } catch (err) {
        console.error("[DB] MongoDB connection error:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
