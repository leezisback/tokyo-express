// backend/src/controllers/upload.controller.js
exports.uploadImage = (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Файл не загружен" });
        }

        // Формируем полный URL к изображению
        const protocol = req.protocol; // http или https
        const host = req.get("host"); // localhost:5001 или домен
        const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        return res.status(201).json({
            path: fullUrl,
            filename: req.file.filename,
        });
    } catch (err) {
        next(err);
    }
};
