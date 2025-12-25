// src/lib/imageUtils.js

/**
 * Преобразует путь к изображению в полный URL
 * Поддерживает как полные URL (http://...), так и относительные пути (/uploads/...)
 */
export function getImageUrl(imagePath) {
    if (!imagePath) return "";

    // Если уже полный URL (начинается с http:// или https://)
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    // Если относительный путь, добавляем базовый URL API
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";

    // Убираем двойные слеши
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${apiBase}${cleanPath}`;
}
