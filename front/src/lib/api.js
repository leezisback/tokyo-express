// src/lib/api.js
const Api = "";

async function toJsonOrThrow(r, defaultMessage = "Ошибка запроса") {
    let data = null;
    try {
        data = await r.json();
    } catch (_) {
        // пустой body
    }
    if (!r.ok) {
        const msg = data?.message || defaultMessage;
        throw new Error(msg);
    }
    return data;
}
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
export async function loginAdmin({ login, password }) {
    const r = await fetch(`${Api}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
    });

    if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        const msg = data?.message || "Ошибка авторизации";
        throw new Error(msg);
    }

    return r.json(); // { token, user: {id, login, role, name} }
}
export async function adminCreateCategory(data, token) {
    const r = await fetch(`${Api}/api/catalog/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось создать категорию");
}

export async function adminUpdateCategory(id, data, token) {
    const r = await fetch(`${Api}/api/catalog/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось обновить категорию");
}

export async function adminDeleteCategory(id, token) {
    const r = await fetch(`${Api}/api/catalog/categories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось удалить категорию");
}

// === Админ: товары ===

export async function adminCreateProduct(data, token) {
    const r = await fetch(`${Api}/api/catalog/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось создать товар");
}
// === Админ: заказы ===

export async function adminFetchOrders(token) {
    const r = await fetch(`${Api}/api/orders`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось загрузить заказы");
}

export async function adminFetchOrder(id, token) {
    const r = await fetch(`${Api}/api/orders/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось загрузить заказ");
}

export async function adminUpdateOrderStatus(id, status, token) {
    const r = await fetch(`${Api}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });
    return toJsonOrThrow(r, "Не удалось изменить статус заказа");
}

export async function adminUpdateProduct(id, data, token) {
    const r = await fetch(`${Api}/api/catalog/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось обновить товар");
}

export async function adminDeleteProduct(id, token) {
    const r = await fetch(`${Api}/api/catalog/products/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось удалить товар");
}

// === Админ: загрузка изображения ===

export async function uploadImage(file, token) {
    const formData = new FormData();
    formData.append("image", file);

    const r = await fetch(`${Api}/api/upload/image`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return toJsonOrThrow(r, "Не удалось загрузить изображение");
}
// === Админ: акции ===

export async function adminFetchAllPromotions(token) {
    const r = await fetch(`${Api}/api/promotions/all`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось загрузить список акций");
}

export async function adminCreatePromotion(data, token) {
    const r = await fetch(`${Api}/api/promotions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось создать акцию");
}

export async function adminUpdatePromotion(id, data, token) {
    const r = await fetch(`${Api}/api/promotions/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось обновить акцию");
}

export async function adminDeletePromotion(id, token) {
    const r = await fetch(`${Api}/api/promotions/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось удалить акцию");
}

// Получить статистику за сегодня
export async function adminFetchStats(token) {
    const r = await fetch(`${Api}/api/stats/today`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return toJsonOrThrow(r, "Не удалось загрузить статистику");
}

// Обновить заказ (состав, адрес, телефон, комментарий)
export async function adminUpdateOrder(id, data, token) {
    const r = await fetch(`${Api}/api/orders/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return toJsonOrThrow(r, "Не удалось обновить заказ");
}
