// src/pages/Admin/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    adminFetchOrders,
    adminUpdateOrderStatus,
} from "@/lib/api";
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
    return STATUS_OPTIONS.find((s) => s.value === value)?.label || value;
}

export default function AdminOrdersPage() {
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [tab, setTab] = useState("all"); // all | delivery | pickup
    const [statusFilter, setStatusFilter] = useState("all");

    const [selected, setSelected] = useState(null); // заказ для модалки
    const [statusSaving, setStatusSaving] = useState(false);

    // загрузка заказов
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

    const filteredOrders = useMemo(() => {
        let list = orders.slice();

        if (tab !== "all") {
            list = list.filter((o) => o.mode === tab);
        }

        if (statusFilter !== "all") {
            list = list.filter((o) => o.status === statusFilter);
        }

        // сортируем по дате (новые сверху)
        list.sort((a, b) => {
            const da = a.createdAt ? +new Date(a.createdAt) : 0;
            const db = b.createdAt ? +new Date(b.createdAt) : 0;
            return db - da;
        });

        return list;
    }, [orders, tab, statusFilter]);

    const openModal = (order) => {
        setSelected(order);
    };

    const closeModal = () => {
        setSelected(null);
    };

    const handleChangeStatus = async (orderId, newStatus) => {
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
        try {
            setStatusSaving(true);
            const updated = await adminUpdateOrderStatus(
                orderId,
                newStatus,
                token,
            );

            // обновляем в общем списке
            setOrders((list) =>
                list.map((o) =>
                    o._id === updated._id ? { ...o, ...updated } : o,
                ),
            );

            // и в модалке
            setSelected((prev) =>
                prev && prev._id === updated._id
                    ? { ...prev, ...updated }
                    : prev,
            );
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка обновления статуса");
        } finally {
            setStatusSaving(false);
        }
    };

    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">
                Заказы
            </h2>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mb-3 text-sm text-neutral-600">
                    Загружаем заказы...
                </div>
            )}

            {/* Вкладки: все / доставка / самовывоз */}
            <div className="mb-3 flex flex-wrap gap-2">
                {[
                    { key: "all", label: "Все" },
                    { key: "delivery", label: "Доставка" },
                    { key: "pickup", label: "Самовывоз" },
                ].map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border ${
                            tab === t.key
                                ? "bg-[var(--brand-rose)] text-white border-transparent"
                                : "bg-white text-neutral-800 hover:bg-neutral-50"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}

                <div className="ml-auto flex items-center gap-2 text-xs">
                    <span className="text-neutral-500">
                        Статус:
                    </span>
                    <select
                        className="rounded-full border px-2 py-1 text-xs"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="all">Все</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Таблица заказов */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
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
                        <th className="px-3 py-2 text-right" />
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.map((o) => (
                        <tr
                            key={o._id}
                            className="border-t last:border-b hover:bg-neutral-50 cursor-pointer"
                            onClick={() => openModal(o)}
                        >
                            <td className="px-3 py-2 align-top">
                                <div className="font-semibold">
                                    {o.shortId || o._id?.slice(-6)}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                    {formatDateTime(o.createdAt)}
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
                                <div className="text-[11px]">
                                    Товары: {o.subtotal} ₽
                                </div>
                                <div className="text-[11px]">
                                    Дост.: {o.deliveryPrice} ₽
                                </div>
                                <div className="mt-0.5 text-xs font-semibold">
                                    {o.total} ₽
                                </div>
                            </td>
                            <td className="px-3 py-2 align-top text-center">
                                    <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                                        {statusLabel(o.status)}
                                    </span>
                            </td>
                            <td
                                className="px-3 py-2 align-top text-right"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* маленькая кнопка для открытия, если не хочется кликать по строке */}
                                <button
                                    type="button"
                                    className="rounded-full border px-2 py-0.5 text-[10px]"
                                    onClick={() => openModal(o)}
                                >
                                    Открыть
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!filteredOrders.length && (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-3 py-4 text-center text-xs text-neutral-500"
                            >
                                Заказов не найдено
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Модалка заказа */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="modal max-h-[90vh] w-full max-w-3xl overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Заказ #{" "}
                                    {selected.shortId ||
                                        selected._id?.slice(-6)}
                                </h3>
                                <div className="mt-1 text-xs text-neutral-500">
                                    {formatDateTime(
                                        selected.createdAt,
                                    )}{" "}
                                    ·{" "}
                                    {selected.mode === "pickup"
                                        ? "Самовывоз"
                                        : "Доставка"}
                                </div>
                            </div>
                            <button
                                className="rounded-full p-1 hover:bg-neutral-100"
                                onClick={closeModal}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Статус + телефон */}
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-600">
                                    Статус:
                                </span>
                                <select
                                    className="rounded-full border px-2 py-1 text-xs"
                                    value={selected.status}
                                    disabled={statusSaving}
                                    onChange={(e) =>
                                        handleChangeStatus(
                                            selected._id,
                                            e.target.value,
                                        )
                                    }
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option
                                            key={s.value}
                                            value={s.value}
                                        >
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-600">
                                    Телефон:
                                </span>
                                <a
                                    href={`tel:${selected.phone}`}
                                    className="font-semibold"
                                >
                                    {selected.phone}
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[1.2fr_minmax(0,1fr)] items-start text-xs">
                            {/* Левая часть: адрес, комментарий */}
                            <div className="space-y-2">
                                {selected.mode === "delivery" && (
                                    <div className="rounded-xl border bg-neutral-50 px-3 py-2">
                                        <div className="text-[11px] text-neutral-600 mb-1">
                                            Адрес доставки
                                        </div>
                                        <div className="text-xs">
                                            {[
                                                selected.address?.street,
                                                selected.address?.house,
                                                selected.address?.entrance &&
                                                `подъезд ${selected.address?.entrance}`,
                                                selected.address?.floor &&
                                                `этаж ${selected.address?.floor}`,
                                                selected.address?.apartment &&
                                                `кв. ${selected.address?.apartment}`,
                                                selected.address
                                                    ?.isPrivateHouse &&
                                                "частный дом",
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </div>
                                    </div>
                                )}

                                {selected.comment && (
                                    <div className="rounded-xl border bg-neutral-50 px-3 py-2">
                                        <div className="text-[11px] text-neutral-600 mb-1">
                                            Комментарий клиента
                                        </div>
                                        <div className="text-xs">
                                            {selected.comment}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Правая часть: суммы */}
                            <div className="rounded-xl border bg-neutral-50 px-3 py-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Товары</span>
                                    <span>
                                        {selected.subtotal} ₽
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Доставка</span>
                                    <span>
                                        {selected.deliveryPrice} ₽
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold border-t pt-1 mt-1">
                                    <span>Итого</span>
                                    <span>{selected.total} ₽</span>
                                </div>
                            </div>
                        </div>

                        {/* Позиции заказа */}
                        <div className="mt-4 rounded-2xl border bg-white">
                            <div className="border-b px-3 py-2 text-xs font-semibold">
                                Позиции
                            </div>
                            <table className="min-w-full text-xs">
                                <thead>
                                <tr className="bg-neutral-50">
                                    <th className="px-3 py-1 text-left">
                                        Товар
                                    </th>
                                    <th className="px-3 py-1 text-right">
                                        Цена
                                    </th>
                                    <th className="px-3 py-1 text-center">
                                        Кол-во
                                    </th>
                                    <th className="px-3 py-1 text-right">
                                        Сумма
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {(selected.items || []).map((it, i) => (
                                    <tr key={i} className="border-t last:border-b">
                                        <td className="px-3 py-1">
                                            {it.name}
                                        </td>
                                        <td className="px-3 py-1 text-right">
                                            {it.price} ₽
                                        </td>
                                        <td className="px-3 py-1 text-center">
                                            {it.qty}
                                        </td>
                                        <td className="px-3 py-1 text-right">
                                            {it.price * it.qty} ₽
                                        </td>
                                    </tr>
                                ))}
                                {(!selected.items ||
                                    !selected.items.length) && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-3 py-2 text-center text-xs text-neutral-500"
                                        >
                                            Нет позиций
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
