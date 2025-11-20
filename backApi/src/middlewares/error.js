// src/middlewares/error.js
function errorMiddleware(err, req, res, next) {
    console.error("[ERROR]", err);

    if (res.headersSent) {
        return next(err);
    }

    const status = err.statusCode || err.status || 500;
    const message = err.message || "Internal server error";

    res.status(status).json({
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
}

module.exports = errorMiddleware;
