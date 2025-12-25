// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "tokyo-express-cart";

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // Загрузка корзины из localStorage при монтировании
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setCart(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load cart from localStorage", e);
        }
    }, []);

    // Сохранение корзины в localStorage при изменении
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart to localStorage", e);
        }
    }, [cart]);

    // Добавить товар в корзину
    const addToCart = (product) => {
        if (!product || !product.id) return;

        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            }

            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name || "Товар",
                    price: product.price || 0,
                    image: product.image || "",
                    weight: product.weight || "",
                    composition: product.composition || product.description || "",
                    qty: 1,
                },
            ];
        });
    };

    // Изменить количество товара
    const updateQuantity = (productId, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.productId === productId) {
                        const newQty = item.qty + delta;
                        if (newQty < 1) return null; // удалить
                        return { ...item, qty: newQty };
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    // Удалить товар из корзины
    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    // Очистить корзину
    const clearCart = () => {
        setCart([]);
    };

    // Получить общую стоимость товаров
    const getSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    };

    // Получить количество товаров
    const getItemsCount = () => {
        return cart.reduce((sum, item) => sum + item.qty, 0);
    };

    const value = {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getItemsCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
}
