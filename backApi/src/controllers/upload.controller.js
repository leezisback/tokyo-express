// backend/src/controllers/upload.controller.js
exports.uploadImage = (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Файл не загружен" });
        }

        const relativePath = `/uploads/${req.file.filename}`;

        return res.status(201).json({
            path: relativePath,
            filename: req.file.filename,
        });
    } catch (err) {
        next(err);
    }
};
