// src/pages/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { adminFetchStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";

function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusLabel(value) {
    const labels = {
        new: "Новый",
        accepted: "Принят",
        cooking: "Готовится",
        to_courier: "Передан курьеру",
        on_way: "В пути",
        done: "Выполнен",
        canceled: "Отменен",
    };
    return labels[value] || value;
}

export default function AdminDashboardPage() {
    const { token } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Нет токена авторизации");
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await adminFetchStats(token);
                setStats(data);
            } catch (e) {
                console.error(e);
                setError(e.message || "Ошибка загрузки статистики");
            } finally {
                setLoading(false);
            }
        }

        load();
        // Обновляем каждую минуту
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, [token]);

    if (loading) {
        return (
            <section>
                <h2 className="mb-3 text-lg font-semibold">Обзор</h2>
                <div className="text-sm text-neutral-600">
                    Загрузка статистики...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="mb-3 text-lg font-semibold">Обзор</h2>
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            </section>
        );
    }

    const { today, activeOrders = [] } = stats || {};

    return (
        <section>
            <h2 className="mb-4 text-lg font-semibold">Обзор</h2>

            {/* Статистика за сегодня */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-xs text-neutral-600 mb-1">
                        Выручка за сегодня
                    </div>
                    <div className="text-2xl font-bold text-[var(--brand-rose)]">
                        {today?.revenue || 0} ₽
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-xs text-neutral-600 mb-1">
                        Количество заказов
                    </div>
                    <div className="text-2xl font-bold">
                        {today?.ordersCount || 0}
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-xs text-neutral-600 mb-1">
                        Средний чек
                    </div>
                    <div className="text-2xl font-bold">
                        {today?.avgCheck || 0} ₽
                    </div>
                </div>
            </div>

            {/* Активные заказы */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="border-b px-4 py-3 font-semibold">
                    Активные заказы
                </div>

                {activeOrders.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-neutral-500">
                        Нет активных заказов
                    </div>
                )}

                {activeOrders.length > 0 && (
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-neutral-50">
                                <th className="px-3 py-2 text-left">№</th>
                                <th className="px-3 py-2 text-left">Время</th>
                                <th className="px-3 py-2 text-left">Телефон</th>
                                <th className="px-3 py-2 text-center">Статус</th>
                                <th className="px-3 py-2 text-right">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeOrders.map((order) => (
                                <tr
                                    key={order._id}
                                    className="border-t hover:bg-neutral-50"
                                >
                                    <td className="px-3 py-2">
                                        {order.shortId || order._id?.slice(-6)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {formatDateTime(order.createdAt)}
                                    </td>
                                    <td className="px-3 py-2">{order.phone}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                                            {statusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold">
                                        {order.total} ₽
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
