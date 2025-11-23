// src/components/ProductModal.jsx
import React from "react";

export default function ProductModal({ product, open, onClose, onAdd }) {
    if (!product) return null;

    const hasImg = Boolean(product.image);

    const composition = product.composition || product.description || "";
    const weight = product.weight || "";

    return (
        <div
            className={`fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-center justify-center bg-black/40 p-4`}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="modal w-full max-w-3xl"
            >
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-2xl font-semibold">{product.name}</h3>
                    <button
                        className="rounded-full p-1 hover:bg-neutral-100"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Блок изображения */}
                    <div className="flex items-center justify-center">
                        <div className="w-full overflow-hidden rounded-2xl bg-neutral-200">
                            <div className="aspect-[4/3] w-full">
                                {hasImg ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="grid h-full w-full place-items-center text-xs text-neutral-400">
                                        image
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Описание / кнопки */}
                    <div>
                        {composition && (
                            <div className="mb-3 text-sm opacity-80">
                                Состав: {composition}
                            </div>
                        )}

                        {weight && (
                            <div className="mb-6 text-sm opacity-80">
                                {weight}
                            </div>
                        )}

                        <div className="mb-6 text-right text-xl font-semibold">
                            {product.price}₽
                        </div>
                        <button
                            className="rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow"
                            onClick={() => {
                                onAdd(product);
                                onClose();
                            }}
                        >
                            Добавить в корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
