// src/pages/Admin/Promotions.jsx
import React, { useEffect, useState } from "react";
import {
    adminFetchAllPromotions,
    adminCreatePromotion,
    adminUpdatePromotion,
    adminDeletePromotion,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";

function formatDateInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    // YYYY-MM-DD
    return d.toISOString().slice(0, 10);
}

export default function AdminPromotionsPage() {
    const { token } = useAuth();

    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        id: null,
        title: "",
        description: "",
        discountPercent: "",
        minOrderTotal: "",
        activeFrom: "",
        activeTo: "",
        isActive: true,
    });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    // загрузка всех акций
    useEffect(() => {
        if (!token) {
            setError("Нет токена авторизации (войдите заново)");
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await adminFetchAllPromotions(token);
                const norm = (data || []).map((p) => ({
                    ...p,
                    id: p._id,
                }));
                setPromos(norm);
            } catch (e) {
                console.error(e);
                setError(e.message || "Ошибка загрузки акций");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [token]);

    const resetForm = () => {
        setForm({
            id: null,
            title: "",
            description: "",
            discountPercent: "",
            minOrderTotal: "",
            activeFrom: "",
            activeTo: "",
            isActive: true,
        });
        setFormError(null);
    };

    const handleChange = (field) => (e) => {
        if (field === "isActive") {
            setForm((f) => ({ ...f, isActive: e.target.checked }));
        } else {
            setForm((f) => ({ ...f, [field]: e.target.value }));
        }
    };

    const handleEdit = (p) => {
        setForm({
            id: p._id,
            title: p.title || "",
            description: p.description || "",
            discountPercent:
                p.discountPercent != null ? String(p.discountPercent) : "",
            minOrderTotal:
                p.minOrderTotal != null ? String(p.minOrderTotal) : "",
            activeFrom: formatDateInput(p.activeFrom),
            activeTo: formatDateInput(p.activeTo),
            isActive: p.isActive ?? true,
        });
        setFormError(null);
    };

    const handleDelete = async (p) => {
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
        if (!window.confirm(`Удалить акцию "${p.title}"?`)) return;

        try {
            await adminDeletePromotion(p._id, token);
            setPromos((list) => list.filter((x) => x._id !== p._id));
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка удаления акции");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!token) {
            setFormError("Нет токена авторизации");
            return;
        }
        if (!form.title.trim()) {
            setFormError("Укажите заголовок акции");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            discountPercent: form.discountPercent
                ? Number(form.discountPercent) || 0
                : 0,
            minOrderTotal: form.minOrderTotal
                ? Number(form.minOrderTotal) || 0
                : 0,
            activeFrom: form.activeFrom || null,
            activeTo: form.activeTo || null,
            isActive: Boolean(form.isActive),
        };

        try {
            setSaving(true);

            if (form.id) {
                const updated = await adminUpdatePromotion(
                    form.id,
                    payload,
                    token,
                );
                setPromos((list) =>
                    list.map((p) =>
                        p._id === updated._id ? { ...p, ...updated } : p,
                    ),
                );
            } else {
                const created = await adminCreatePromotion(
                    payload,
                    token,
                );
                setPromos((list) => [...list, created]);
            }

            resetForm();
        } catch (e) {
            console.error(e);
            setFormError(e.message || "Ошибка сохранения акции");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">
                Акции
            </h2>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mb-3 text-sm text-neutral-600">
                    Загружаем акции...
                </div>
            )}

            {/* список акций */}
            <div className="mb-4 rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="border-b px-3 py-2 text-xs font-semibold">
                    Список акций
                </div>
                <table className="min-w-full text-xs">
                    <thead>
                    <tr className="bg-neutral-50">
                        <th className="px-3 py-2 text-left">
                            Заголовок
                        </th>
                        <th className="px-3 py-2 text-left">
                            Скидка
                        </th>
                        <th className="px-3 py-2 text-left">
                            Мин. сумма
                        </th>
                        <th className="px-3 py-2 text-left">
                            Период
                        </th>
                        <th className="px-3 py-2 text-center">
                            Активна
                        </th>
                        <th className="px-3 py-2 text-right" />
                    </tr>
                    </thead>
                    <tbody>
                    {promos.map((p) => (
                        <tr
                            key={p._id}
                            className="border-t last:border-b"
                        >
                            <td className="px-3 py-2 align-top">
                                <div className="font-semibold">
                                    {p.title}
                                </div>
                                {p.description && (
                                    <div className="mt-0.5 text-[11px] text-neutral-600 line-clamp-2">
                                        {p.description}
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-2 align-top">
                                {p.discountPercent
                                    ? `-${p.discountPercent}%`
                                    : "—"}
                            </td>
                            <td className="px-3 py-2 align-top">
                                {p.minOrderTotal
                                    ? `${p.minOrderTotal} ₽`
                                    : "—"}
                            </td>
                            <td className="px-3 py-2 align-top text-[11px] text-neutral-700">
                                {p.activeFrom && (
                                    <div>
                                        c{" "}
                                        {formatDateInput(
                                            p.activeFrom,
                                        )}
                                    </div>
                                )}
                                {p.activeTo && (
                                    <div>
                                        по{" "}
                                        {formatDateInput(
                                            p.activeTo,
                                        )}
                                    </div>
                                )}
                                {!p.activeFrom && !p.activeTo && (
                                    <div>Без ограничений</div>
                                )}
                            </td>
                            <td className="px-3 py-2 align-top text-center">
                                {p.isActive ? "Да" : "Нет"}
                            </td>
                            <td className="px-3 py-2 align-top text-right">
                                <button
                                    type="button"
                                    className="mr-1 rounded-full border px-2 py-0.5 text-[11px]"
                                    onClick={() => handleEdit(p)}
                                >
                                    Изм.
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full border px-2 py-0.5 text-[11px] text-red-600"
                                    onClick={() => handleDelete(p)}
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!promos.length && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-3 py-4 text-center text-xs text-neutral-500"
                            >
                                Акций пока нет
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* форма создания/редактирования */}
            <div className="rounded-2xl border bg-white shadow-sm p-4 text-xs">
                <h3 className="mb-3 text-sm font-semibold">
                    {form.id ? "Редактировать акцию" : "Создать акцию"}
                </h3>

                {formError && (
                    <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                        {formError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-2"
                >
                    <div className="grid gap-2 md:grid-cols-2">
                        <label className="md:col-span-2">
                            Заголовок
                            <input
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                value={form.title}
                                onChange={handleChange("title")}
                            />
                        </label>

                        <label className="md:col-span-2">
                            Описание
                            <textarea
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                rows={2}
                                value={form.description}
                                onChange={handleChange("description")}
                            />
                        </label>

                        <label>
                            Скидка, %
                            <input
                                type="number"
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                value={form.discountPercent}
                                onChange={handleChange("discountPercent")}
                                placeholder="например 20"
                            />
                        </label>

                        <label>
                            Мин. сумма заказа, ₽
                            <input
                                type="number"
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                value={form.minOrderTotal}
                                onChange={handleChange("minOrderTotal")}
                                placeholder="например 2000"
                            />
                        </label>

                        <label>
                            Активна с
                            <input
                                type="date"
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                value={form.activeFrom}
                                onChange={handleChange("activeFrom")}
                            />
                        </label>

                        <label>
                            Активна по
                            <input
                                type="date"
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                value={form.activeTo}
                                onChange={handleChange("activeTo")}
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-2 text-xs mt-1">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={handleChange("isActive")}
                        />
                        Акция активна
                    </label>

                    <div className="mt-3 flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-[var(--brand-rose)] px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-70"
                        >
                            {form.id ? "Сохранить" : "Создать"}
                        </button>
                        {form.id && (
                            <button
                                type="button"
                                className="rounded-xl border px-3 py-1 text-xs"
                                onClick={resetForm}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
