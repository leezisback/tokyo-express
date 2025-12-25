// src/components/ProductCard.jsx
import React from "react";
import { getImageUrl } from "@/lib/imageUtils";

export default function ProductCard({ p, onAdd, onOpen }) {
    const spicyLevel = p.spicyLevel || 0;
    const isPromotion = p.isPromotion && p.discountPercent > 0;
    const originalPrice = isPromotion ? Math.round(p.price / (1 - p.discountPercent / 100)) : p.price;
    const imageUrl = getImageUrl(p.image);

    return (
        <div className="card rounded-2xl border bg-white p-3">
            <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-inner relative">
                <div className="grid aspect-[4/3] w-full place-items-center">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={p.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="text-xs text-neutral-400">image</div>
                    )}
                </div>

                {spicyLevel > 0 && (
                    <div className="absolute top-2 right-2 flex gap-0.5">
                        {Array.from({ length: spicyLevel }).map((_, i) => (
                            <span key={i} className="text-red-500 text-lg drop-shadow">
                🌶️
              </span>
                        ))}
                    </div>
                )}

                {isPromotion && (
                    <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow">
                        -{p.discountPercent}%
                    </div>
                )}
            </div>

            <div className="mb-1 line-clamp-1 text-sm font-medium">{p.name}</div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="text-lg font-semibold">{p.price}₽</div>
                    {isPromotion && <div className="text-xs text-neutral-500 line-through">{originalPrice}₽</div>}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => onOpen?.(p)} className="text-xs underline opacity-70 hover:opacity-100">
                        Подробнее
                    </button>

                    {/* ✅ Это НЕ "быстрый заказ", это "добавить в корзину" */}
                    <button
                        type="button"
                        onClick={() => onAdd?.(p)}
                        className="grid h-7 w-7 place-items-center rounded-full border border-black/60 text-lg leading-none hover:bg-black hover:text-white"
                        aria-label="Добавить в корзину"
                        title="Добавить в корзину"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
