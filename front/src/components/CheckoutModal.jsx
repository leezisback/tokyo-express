// src/components/CheckoutModal.jsx
import React, { useEffect, useState } from "react";

const initialForm = {
    street: "",
    house: "",
    entrance: "",
    floor: "",
    apartment: "",
    isPrivateHouse: false,
    phone: "",
    comment: "",
};

export default function CheckoutModal({
                                          open,
                                          onClose,
                                          cart = [],
                                          onSubmit,
                                          loading = false,
                                          error,             // сетевой/серверный error из родителя
                                      }) {
    const [mode, setMode] = useState("delivery");
    const [form, setForm] = useState(initialForm);
    const [localError, setLocalError] = useState("");

    // сброс формы при закрытии
    useEffect(() => {
        if (!open) {
            setMode("delivery");
            setForm(initialForm);
            setLocalError("");
        }
    }, [open]);

    const handleChange = (field) => (e) => {
        const value =
            field === "isPrivateHouse" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [field]: value }));
    };

    const handleSubmit = async (submitMode) => {
        if (!cart.length) {
            setLocalError("Корзина пуста. Добавьте товары перед заказом.");
            return;
        }

        if (!form.phone.trim()) {
            setLocalError("Укажите номер телефона.");
            return;
        }

        // для доставки обязательна улица + дом
        if (submitMode === "delivery") {
            if (!form.street.trim() || !form.house.trim()) {
                setLocalError("Для доставки укажите улицу и дом.");
                return;
            }
        }

        if (typeof onSubmit !== "function") return;

        try {
            setLocalError("");
            await onSubmit(submitMode, form);
        } catch (e) {
            // onSubmit уже обработает ошибку, здесь просто подстрахуемся
            console.error(e);
            setLocalError("Не удалось оформить заказ. Попробуйте ещё раз.");
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="modal w-full max-w-3xl"
            >
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">Оформление заказа</h3>
                    <button
                        className="rounded-full p-1 hover:bg-neutral-100"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {/* режимы: доставка / самовывоз */}
                <div className="mb-4 flex gap-2">
                    <button
                        type="button"
                        className={`rounded-full px-4 py-2 ${
                            mode === "delivery"
                                ? "bg-[var(--brand-rose)] text-white"
                                : "bg-neutral-100"
                        }`}
                        onClick={() => setMode("delivery")}
                        disabled={loading}
                    >
                        Доставка
                    </button>
                    <button
                        type="button"
                        className={`rounded-full px-4 py-2 ${
                            mode === "pickup"
                                ? "bg-[var(--brand-rose)] text-white"
                                : "bg-neutral-100"
                        }`}
                        onClick={() => setMode("pickup")}
                        disabled={loading}
                    >
                        Самовывоз
                    </button>
                </div>

                {/* ошибки */}
                {(localError || error) && (
                    <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                        {localError || error}
                    </div>
                )}

                {mode === "delivery" ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="col-span-2 text-sm">
                            Улица
                            <input
                                className="mt-1 w-full rounded-full bg-neutral-200 px-4 py-2"
                                value={form.street}
                                onChange={handleChange("street")}
                                disabled={loading}
                            />
                        </label>

                        <label className="text-sm">
                            Дом
                            <input
                                className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2"
                                value={form.house}
                                onChange={handleChange("house")}
                                disabled={loading}
                            />
                        </label>
                        <label className="text-sm">
                            Подъезд
                            <input
                                className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2"
                                value={form.entrance}
                                onChange={handleChange("entrance")}
                                disabled={loading}
                            />
                        </label>
                        <label className="text-sm">
                            Этаж
                            <input
                                className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2"
                                value={form.floor}
                                onChange={handleChange("floor")}
                                disabled={loading}
                            />
                        </label>
                        <label className="text-sm">
                            Квартира
                            <input
                                className="mt-1 w-full rounded-xl bg-neutral-200 px-4 py-2"
                                value={form.apartment}
                                onChange={handleChange("apartment")}
                                disabled={loading}
                            />
                        </label>

                        <div className="col-span-2 flex items-center gap-2 text-sm">
                            <input
                                id="private"
                                type="checkbox"
                                className="h-4 w-4"
                                checked={form.isPrivateHouse}
                                onChange={handleChange("isPrivateHouse")}
                                disabled={loading}
                            />
                            <label htmlFor="private">частный дом</label>
                        </div>

                        <label className="col-span-2 text-sm">
                            Номер телефона
                            <input
                                className="mt-1 w-full rounded-full bg-neutral-200 px-4 py-2"
                                value={form.phone}
                                onChange={handleChange("phone")}
                                disabled={loading}
                            />
                        </label>

                        <label className="col-span-2 text-sm">
                            Комментарий
                            <textarea
                                className="mt-1 w-full rounded-2xl bg-neutral-200 px-4 py-2"
                                rows={4}
                                value={form.comment}
                                onChange={handleChange("comment")}
                                disabled={loading}
                            />
                        </label>

                        <div className="col-span-2 mt-2 flex gap-3">
                            <button
                                type="button"
                                className="rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow"
                                onClick={() => handleSubmit("delivery")}
                                disabled={loading}
                            >
                                {loading ? "Оформляем..." : "Заказать"}
                            </button>
                            <button
                                type="button"
                                className="rounded-xl bg-neutral-200 px-6 py-3 text-sm font-semibold text-black shadow-inner"
                                onClick={() => setMode("pickup")}
                                disabled={loading}
                            >
                                Заберу сам
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        <label className="text-sm">
                            Номер телефона
                            <input
                                className="mt-1 w-full rounded-full bg-neutral-200 px-4 py-2"
                                value={form.phone}
                                onChange={handleChange("phone")}
                                disabled={loading}
                            />
                        </label>
                        <label className="text-sm">
                            Комментарий
                            <textarea
                                className="mt-1 w-full rounded-2xl bg-neutral-200 px-4 py-2"
                                rows={4}
                                value={form.comment}
                                onChange={handleChange("comment")}
                                disabled={loading}
                            />
                        </label>
                        <div className="mt-2 flex gap-3">
                            <button
                                type="button"
                                className="rounded-xl bg-[var(--brand-rose)] px-6 py-3 font-semibold text-white shadow"
                                onClick={() => handleSubmit("pickup")}
                                disabled={loading}
                            >
                                {loading ? "Оформляем..." : "Заказать"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
