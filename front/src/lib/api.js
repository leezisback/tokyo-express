// src/lib/api.js
const Api = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Список категорий (публичный)
export async function fetchCategories() {
    const r = await fetch(`${Api}/api/catalog/categories`);
    if (!r.ok) {
        console.error("Categories fetch error", r.status);
        throw new Error("Categories fetch error");
    }
    return r.json();
}

// Список товаров (публичный)
// params: { category, search, isPromotion } — опционально
export async function fetchProducts(params = {}) {
    const q = new URLSearchParams(params).toString();
    const url = q ? `${Api}/api/catalog/products?${q}` : `${Api}/api/catalog/products`;
    const r = await fetch(url);
    if (!r.ok) {
        console.error("Products fetch error", r.status);
        throw new Error("Products fetch error");
    }
    return r.json();
}

// Создание заказа (публичный)
export async function createOrder(payload) {
    const r = await fetch(`${Api}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!r.ok) {
        console.error("Order error", r.status);
        throw new Error("Order error");
    }
    return r.json();
}
export async function fetchPromotions() {
    const r = await fetch(`${Api}/api/promotions`);
    if (!r.ok) {
        console.error("Promotions fetch error", r.status);
        throw new Error("Promotions fetch error");
    }
    return r.json();
}