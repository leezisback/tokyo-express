import React from "react";
import { getImageUrl } from "@/lib/imageUtils";
import { useCart } from "@/context/CartContext";

export default function CartSheet({ open, onClose, onCheckout }) {
    const { cart, updateQuantity, removeFromCart, getSubtotal } = useCart();

    const subtotal = getSubtotal();
    const delivery = 150;
    const total = subtotal + delivery;

    const handleDecrease = (productId, currentQty) => {
        if (currentQty <= 1) {
            if (confirm("Удалить товар из корзины?")) {
                removeFromCart(productId);
            }
        } else {
            updateQuantity(productId, -1);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-start justify-center bg-black/40 p-4`}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} className="modal w-full max-w-5xl max-h-[90vh] overflow-auto">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 py-1">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#cf4e4e] text-sm text-white">●</span>
                        <span className="text-xl font-semibold">Корзина</span>
                    </div>
                    <button className="rounded-full p-1 hover:bg-neutral-100" onClick={onClose}>✕</button>
                </div>

                {cart.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500">
                        Корзина пуста
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
                        <div className="flex flex-col gap-3">
                            {cart.map((item) => {
                                const imageUrl = getImageUrl(item.image);
                                return (
                                    <div key={item.productId} className="flex items-start gap-3 border-b pb-3">
                                        {/* Изображение */}
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center text-[10px] text-neutral-400">
                                                    фото
                                                </div>
                                            )}
                                        </div>

                                        {/* Информация о товаре */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{item.name}</div>
                                            {item.weight && (
                                                <div className="mt-0.5 text-xs text-neutral-500">{item.weight}</div>
                                            )}
                                            {item.composition && (
                                                <div className="mt-1 text-xs text-neutral-600 line-clamp-1">
                                                    {item.composition}
                                                </div>
                                            )}

                                            {/* Количество */}
                                            <div className="mt-2 flex items-center gap-2">
                                                <button
                                                    className="grid h-6 w-6 place-items-center rounded-full border hover:bg-neutral-50"
                                                    onClick={() => handleDecrease(item.productId, item.qty)}
                                                >
                                                    –
                                                </button>
                                                <span className="min-w-[2rem] text-center text-sm">{item.qty}</span>
                                                <button
                                                    className="grid h-6 w-6 place-items-center rounded-full border hover:bg-neutral-50"
                                                    onClick={() => updateQuantity(item.productId, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Цена и удаление */}
                                        <div className="flex items-start gap-3">
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">{item.price * item.qty}₽</div>
                                                <div className="text-xs text-neutral-500">{item.price}₽ за шт</div>
                                            </div>
                                            <button
                                                className="text-xl leading-none text-neutral-400 hover:text-red-500"
                                                onClick={() => removeFromCart(item.productId)}
                                                title="Удалить"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="rounded-2xl bg-[var(--brand-card)] p-5">
                            <div className="mb-2 flex justify-between text-sm">
                                <span>Товары</span>
                                <span>{subtotal}₽</span>
                            </div>
                            <div className="mb-4 flex justify-between text-sm">
                                <span>Доставка</span>
                                <span>{delivery}₽</span>
                            </div>
                            <div className="mb-4 flex justify-between text-lg font-semibold">
                                <span>Итого</span>
                                <span>{total}₽</span>
                            </div>
                            <button
                                className="w-full rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow hover:opacity-90"
                                onClick={onCheckout}
                            >
                                Оформить заказ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
