import dotenv from 'dotenv'
dotenv.config()

export const env = {
    PORT: process.env.PORT || 5001,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    UPLOADS_DIR: process.env.UPLOADS_DIR || 'uploads',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
