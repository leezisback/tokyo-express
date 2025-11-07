import React, { useState } from "react";

export default function CheckoutModal({ open, onClose }) {
    const [mode, setMode] = useState("delivery");
    return (
        <div
            className={`fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-center justify-center bg-black/40 p-4`}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} className="modal w-full max-w-3xl">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">Оформление заказа</h3>
                    <button className="rounded-full p-1 hover:bg-neutral-100" onClick={onClose}>✕</button>
                </div>

                <div className="mb-4 flex gap-2">
                    <button
                        className={`rounded-full px-4 py-2 ${mode === "delivery" ? "bg-[var(--brand-rose)] text-white" : "bg-neutral-100"}`}
                        onClick={() => setMode("delivery")}
                    >
                        Доставка
                    </button>
                    <button
                        className={`rounded-full px-4 py-2 ${mode === "pickup" ? "bg-[var(--brand-rose)] text-white" : "bg-neutral-100"}`}
                        onClick={() => setMode("pickup")}
                    >
                        Самовывоз
                    </button>
                </div>

                {mode === "delivery" ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="col-span-2 text-sm">
                            Улица
                            <input className="mt-1 w-full rounded-full bg-neutral-200 px-4 py-2" />
                        </label>
                        <label className="text-sm">Дом<input className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2" /></label>
                        <label className="text-sm">Подъезд<input className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2" /></label>
                        <label className="text-sm">Этаж<input className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2" /></label>
                        <label className="text-sm">Квартира<input className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2" /></label>

                        <div className="col-span-2 flex items-center gap-2 text-sm">
                            <input id="private" type="checkbox" className="h-4 w-4" />
                            <label htmlFor="private">частный дом</label>
                        </div>

                        <label className="col-span-2 text-sm">
                            Номер телефона
                            <input className="mt-1 w-full rounded-full bg-neutral-200 px-4 py-2" />
                        </label>
                        <label className="col-span-2 text-sm">
                            Комментарий
                            <textarea className="mt-1 w-full rounded-2xl bg-neutral-200 px-4 py-2" rows={4} />
                        </label>

                        <div className="col-span-2 mt-2 flex gap-3">
                            <button className="rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow">Заказать</button>
                            <button className="rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow">Заберу сам</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        <label className="text-sm">
                            Номер телефона
                            <input className="mt-1 w-full rounded-full bg-neutral-200 px-4 py-2" />
                        </label>
                        <label className="text-sm">
                            Комментарий
                            <textarea className="mt-1 w-full rounded-2xl bg-neutral-200 px-4 py-2" rows={4} />
                        </label>
                        <div className="mt-2 flex gap-3">
                            <button className="rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow">Заказать</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
