// src/pages/Admin/Stats.jsx
import React, { useEffect, useMemo, useState } from "react";
import { adminFetchOrders } from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";

const STATUS_OPTIONS = [
    { value: "new", label: "Новый" },
    { value: "accepted", label: "Принят" },
    { value: "cooking", label: "Готовится" },
    { value: "to_courier", label: "Передан курьеру" },
    { value: "on_way", label: "В пути" },
    { value: "done", label: "Выполнен" },
    { value: "canceled", label: "Отменен" },
];

function statusLabel(value) {
    return STATUS_OPTIONS.find((s) => s.value === value)?.label || value;
}

function isToday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

function formatTime(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminStatsPage() {
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                const data = await adminFetchOrders(token);
                const norm = (data || []).map((o) => ({
                    ...o,
                    id: o._id,
                }));
                setOrders(norm);
            } catch (e) {
                console.error(e);
                setError(e.message || "Ошибка загрузки заказов");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [token]);

    // Заказы за сегодня
    const todayOrders = useMemo(
        () => orders.filter((o) => isToday(o.createdAt)),
        [orders],
    );

    const revenueToday = useMemo(
        () =>
            todayOrders.reduce(
                (sum, o) => sum + (Number(o.total) || 0),
                0,
            ),
        [todayOrders],
    );

    const countToday = todayOrders.length;
    const avgCheckToday = countToday
        ? Math.round(revenueToday / countToday)
        : 0;

    // Активные заказы (в работе / в пути)
    const activeOrders = useMemo(
        () =>
            orders.filter((o) =>
                ["new", "accepted", "cooking", "to_courier", "on_way"].includes(
                    o.status,
                ),
            ),
        [orders],
    );

    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">
                Статистика
            </h2>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mb-3 text-sm text-neutral-600">
                    Загружаем данные по заказам...
                </div>
            )}

            {/* KPI-блоки за сегодня */}
            <div className="mb-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                    <div className="text-xs text-neutral-500">
                        Выручка за сегодня
                    </div>
                    <div className="mt-1 text-2xl font-semibold">
                        {revenueToday} ₽
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                        По всем заказам за текущую дату
                    </div>
                </div>

                <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                    <div className="text-xs text-neutral-500">
                        Количество заказов
                    </div>
                    <div className="mt-1 text-2xl font-semibold">
                        {countToday}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                        Оформлено сегодня
                    </div>
                </div>

                <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                    <div className="text-xs text-neutral-500">
                        Средний чек
                    </div>
                    <div className="mt-1 text-2xl font-semibold">
                        {avgCheckToday} ₽
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                        Выручка / кол-во заказов
                    </div>
                </div>
            </div>

            {/* Блок активных заказов */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
                    <div className="font-semibold">
                        Активные заказы
                    </div>
                    <div className="text-[11px] text-neutral-500">
                        {activeOrders.length
                            ? `Сейчас в работе: ${activeOrders.length}`
                            : "Нет активных заказов"}
                    </div>
                </div>

                <table className="min-w-full text-xs">
                    <thead>
                    <tr className="bg-neutral-50">
                        <th className="px-3 py-2 text-left">
                            № / Время
                        </th>
                        <th className="px-3 py-2 text-left">
                            Клиент
                        </th>
                        <th className="px-3 py-2 text-left">
                            Тип
                        </th>
                        <th className="px-3 py-2 text-left">
                            Адрес / Комментарий
                        </th>
                        <th className="px-3 py-2 text-right">
                            Сумма
                        </th>
                        <th className="px-3 py-2 text-center">
                            Статус
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {activeOrders.map((o) => (
                        <tr
                            key={o._id}
                            className="border-t last:border-b"
                        >
                            <td className="px-3 py-2 align-top">
                                <div className="font-semibold">
                                    {o.shortId || o._id?.slice(-6)}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                    {formatTime(o.createdAt)}
                                </div>
                            </td>
                            <td className="px-3 py-2 align-top">
                                <div className="text-[11px]">
                                    {o.phone}
                                </div>
                            </td>
                            <td className="px-3 py-2 align-top">
                                    <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                                        {o.mode === "pickup"
                                            ? "Самовывоз"
                                            : "Доставка"}
                                    </span>
                            </td>
                            <td className="px-3 py-2 align-top">
                                {o.mode === "delivery" && (
                                    <div className="text-[11px] text-neutral-800">
                                        {[
                                            o.address?.street,
                                            o.address?.house,
                                            o.address?.apartment,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </div>
                                )}
                                {o.comment && (
                                    <div className="mt-0.5 text-[10px] text-neutral-500 line-clamp-2">
                                        {o.comment}
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-2 align-top text-right">
                                <div className="text-xs font-semibold">
                                    {o.total} ₽
                                </div>
                            </td>
                            <td className="px-3 py-2 align-top text-center">
                                    <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                                        {statusLabel(o.status)}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    {!activeOrders.length && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-3 py-4 text-center text-xs text-neutral-500"
                            >
                                Активных заказов нет
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
