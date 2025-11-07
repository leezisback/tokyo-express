import React from "react";

export default function ProductCard({ p, onAdd, onOpen }) {
    return (
        <div className="card rounded-2xl border bg-white p-3">
            <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-inner">
                <div className="grid aspect-[4/3] w-full place-items-center">
                    {p.image ? (
                        <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="text-xs text-neutral-400">image</div>
                    )}
                </div>
            </div>

            <div className="mb-1 line-clamp-1 text-sm font-medium">{p.name}</div>

            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{p.price}₽</div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onOpen(p)}
                        className="text-xs underline opacity-70 hover:opacity-100"
                    >
                        Подробнее
                    </button>
                    <button
                        onClick={() => onAdd(p)}
                        className="grid h-7 w-7 place-items-center rounded-full border border-black/60 text-lg leading-none hover:bg-black hover:text-white"
                        aria-label="Быстрый заказ"
                        title="Быстрый заказ"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
