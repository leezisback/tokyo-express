// src/pages/Admin/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { adminFetchOrders, adminUpdateOrderStatus, adminUpdateOrder } from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";
import { getImageUrl } from "@/lib/imageUtils";

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

function toNum(v, def = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}

function normalizeOrderItem(it = {}) {
    const qty = toNum(it.qty ?? it.quantity ?? it.count ?? 1, 1);
    const price = toNum(it.price ?? it.unitPrice ?? it.product?.price ?? 0, 0);

    const name = it.name ?? it.title ?? it.product?.name ?? it.product?.title ?? "Товар";
    const composition =
        it.composition ??
        it.ingredients ??
        it.product?.composition ??
        it.product?.description ??
        "";
    const weight = it.weight ?? it.product?.weight ?? it.grams ?? "";
    const image = it.image ?? it.product?.image ?? "";

    return {
        key: it._id || it.productId || it.product?._id || `${name}-${price}-${qty}`,
        productId: it.productId || it.product?._id,
        product: it.product,
        name,
        composition,
        weight,
        image,
        price,
        qty,
        lineTotal: price * qty,
    };
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

    // Режим редактирования заказа
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        phone: "",
        comment: "",
        address: {
            street: "",
            house: "",
            entrance: "",
            floor: "",
            apartment: "",
            isPrivateHouse: false,
        },
    });
    const [editSaving, setEditSaving] = useState(false);

    // Состояние для редактирования количества товаров
    const [editedItems, setEditedItems] = useState([]);

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
                const norm = (data || []).map((o) => ({ ...o, id: o._id }));
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

        if (tab !== "all") list = list.filter((o) => o.mode === tab);
        if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

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
        setEditMode(false);
        setEditForm({
            phone: order.phone || "",
            comment: order.comment || "",
            address: {
                street: order.address?.street || "",
                house: order.address?.house || "",
                entrance: order.address?.entrance || "",
                floor: order.address?.floor || "",
                apartment: order.address?.apartment || "",
                isPrivateHouse: order.address?.isPrivateHouse || false,
            },
        });

        // Инициализация editedItems из существующих items заказа
        const normalized = (order.items || []).map(normalizeOrderItem);
        setEditedItems(normalized);
    };

    const closeModal = () => {
        setSelected(null);
        setEditMode(false);
    };

    // ESC закрывает модалку
    useEffect(() => {
        if (!selected) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selected]);

    const handleChangeStatus = async (orderId, newStatus) => {
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
        try {
            setStatusSaving(true);
            const updated = await adminUpdateOrderStatus(orderId, newStatus, token);

            setOrders((list) => list.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)));
            setSelected((prev) => (prev && prev._id === updated._id ? { ...prev, ...updated } : prev));
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка обновления статуса");
        } finally {
            setStatusSaving(false);
        }
    };

    const handleEditFormChange = (field, value) => {
        if (field.startsWith("address.")) {
            const addressField = field.replace("address.", "");
            setEditForm((f) => ({
                ...f,
                address: { ...f.address, [addressField]: value },
            }));
        } else {
            setEditForm((f) => ({ ...f, [field]: value }));
        }
    };

    const handleQuantityChange = (index, delta) => {
        setEditedItems((items) => {
            const newItems = [...items];
            const newQty = newItems[index].qty + delta;

            // Не позволяем количеству быть меньше 1
            if (newQty < 1) return items;

            newItems[index] = {
                ...newItems[index],
                qty: newQty,
                lineTotal: newItems[index].price * newQty,
            };
            return newItems;
        });
    };

    const handleRemoveItem = (index) => {
        if (!confirm("Удалить этот товар из заказа?")) return;
        setEditedItems((items) => items.filter((_, i) => i !== index));
    };

    const handleSaveEdit = async () => {
        if (!token || !selected) return;

        try {
            setEditSaving(true);
            const payload = {
                phone: editForm.phone.trim(),
                comment: editForm.comment.trim(),
            };

            if (selected.mode === "delivery") {
                payload.address = editForm.address;
            }

            // Добавляем обновленные товары в payload
            // Преобразуем editedItems обратно в формат бэкенда
            payload.items = editedItems.map((it) => ({
                productId: it.productId || it.product?._id || it.key,
                name: it.name,
                price: it.price,
                qty: it.qty,
                weight: it.weight,
                composition: it.composition,
                image: it.image,
            }));

            const updated = await adminUpdateOrder(selected._id, payload, token);

            setOrders((list) => list.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)));
            setSelected({ ...selected, ...updated });
            setEditMode(false);
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка сохранения изменений");
        } finally {
            setEditSaving(false);
        }
    };

    const orderItems = useMemo(
        () => (editMode ? editedItems : (selected?.items || []).map(normalizeOrderItem)),
        [selected, editMode, editedItems]
    );

    const itemsSubtotal = useMemo(
        () => orderItems.reduce((sum, it) => sum + toNum(it.lineTotal, 0), 0),
        [orderItems]
    );

    // В режиме редактирования используем пересчитанные суммы
    const computedSubtotal = editMode ? itemsSubtotal : (selected?.subtotal ?? itemsSubtotal);
    const computedDelivery = selected?.deliveryPrice ?? 0;
    const computedTotal = toNum(computedSubtotal, 0) + toNum(computedDelivery, 0);

    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">Заказы</h2>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {loading && <div className="mb-3 text-sm text-neutral-600">Загружаем заказы...</div>}

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
                    <span className="text-neutral-500">Статус:</span>
                    <select
                        className="rounded-full border px-2 py-1 text-xs"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                        <th className="px-3 py-2 text-left">№ / Время</th>
                        <th className="px-3 py-2 text-left">Клиент</th>
                        <th className="px-3 py-2 text-left">Тип</th>
                        <th className="px-3 py-2 text-left">Состав / Адрес</th>
                        <th className="px-3 py-2 text-right">Сумма</th>
                        <th className="px-3 py-2 text-center">Статус</th>
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
                                <div className="font-semibold">{o.shortId || o._id?.slice(-6)}</div>
                                <div className="text-[10px] text-neutral-500">{formatDateTime(o.createdAt)}</div>
                            </td>

                            <td className="px-3 py-2 align-top">
                                <div className="text-[11px]">{o.phone}</div>
                            </td>

                            <td className="px-3 py-2 align-top">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                    {o.mode === "pickup" ? "Самовывоз" : "Доставка"}
                  </span>
                            </td>

                            <td className="px-3 py-2 align-top">
                                {/* Краткий состав заказа */}
                                {o.items && o.items.length > 0 && (
                                    <div className="text-[11px] text-neutral-800 mb-1">
                                        {o.items.map((it, idx) => {
                                            const name = it.name || it.product?.name || "Товар";
                                            const qty = it.qty || it.quantity || 1;
                                            return (
                                                <span key={idx}>
                                                    {name} × {qty}
                                                    {idx < o.items.length - 1 ? ", " : ""}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                                {/* Адрес для доставки */}
                                {o.mode === "delivery" && (
                                    <div className="text-[10px] text-neutral-500">
                                        📍 {[o.address?.street, o.address?.house, o.address?.apartment]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </div>
                                )}
                                {/* Комментарий */}
                                {o.comment && (
                                    <div className="mt-0.5 text-[10px] text-neutral-500 line-clamp-1">
                                        💬 {o.comment}
                                    </div>
                                )}
                            </td>

                            <td className="px-3 py-2 align-top text-right">
                                <div className="text-[11px]">Товары: {o.subtotal} ₽</div>
                                <div className="text-[11px]">Дост.: {o.deliveryPrice} ₽</div>
                                <div className="mt-0.5 text-xs font-semibold">{o.total} ₽</div>
                            </td>

                            <td className="px-3 py-2 align-top text-center">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                    {statusLabel(o.status)}
                  </span>
                            </td>

                            <td className="px-3 py-2 align-top text-right" onClick={(e) => e.stopPropagation()}>
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
                            <td colSpan={7} className="px-3 py-4 text-center text-xs text-neutral-500">
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
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="modal max-h-[90vh] w-full max-w-3xl overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Заказ #{selected.shortId || selected._id?.slice(-6)}
                                </h3>
                                <div className="mt-1 text-xs text-neutral-500">
                                    {formatDateTime(selected.createdAt)} ·{" "}
                                    {selected.mode === "pickup" ? "Самовывоз" : "Доставка"}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="rounded-full p-1 hover:bg-neutral-100"
                                onClick={closeModal}
                                aria-label="Закрыть"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Статус + телефон + кнопка редактирования */}
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-600">Статус:</span>
                                <select
                                    className="rounded-full border px-2 py-1 text-xs"
                                    value={selected.status}
                                    disabled={statusSaving || editMode}
                                    onChange={(e) => handleChangeStatus(selected._id, e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-neutral-600">Телефон:</span>
                                {editMode ? (
                                    <input
                                        type="tel"
                                        className="rounded-full border px-2 py-1 text-xs font-semibold"
                                        value={editForm.phone}
                                        onChange={(e) => handleEditFormChange("phone", e.target.value)}
                                    />
                                ) : (
                                    <a href={`tel:${selected.phone}`} className="font-semibold">
                                        {selected.phone}
                                    </a>
                                )}
                            </div>

                            {!editMode ? (
                                <button
                                    type="button"
                                    className="ml-auto rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                    onClick={() => setEditMode(true)}
                                >
                                    Редактировать
                                </button>
                            ) : (
                                <div className="ml-auto flex gap-2">
                                    <button
                                        type="button"
                                        className="rounded-full border border-green-500 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                        onClick={handleSaveEdit}
                                        disabled={editSaving}
                                    >
                                        {editSaving ? "Сохранение..." : "Сохранить"}
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-full border px-3 py-1 text-xs"
                                        onClick={() => setEditMode(false)}
                                        disabled={editSaving}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-[1.2fr_minmax(0,1fr)] items-start text-xs">
                            {/* Левая часть: адрес, комментарий */}
                            <div className="space-y-2">
                                {selected.mode === "delivery" && (
                                    <div className="rounded-xl border bg-neutral-50 px-3 py-2">
                                        <div className="text-[11px] text-neutral-600 mb-1">Адрес доставки</div>
                                        {!editMode ? (
                                            <div className="text-xs">
                                                {[
                                                    selected.address?.street,
                                                    selected.address?.house,
                                                    selected.address?.entrance && `подъезд ${selected.address?.entrance}`,
                                                    selected.address?.floor && `этаж ${selected.address?.floor}`,
                                                    selected.address?.apartment && `кв. ${selected.address?.apartment}`,
                                                    selected.address?.isPrivateHouse && "частный дом",
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </div>
                                        ) : (
                                            <div className="space-y-1 mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="Улица"
                                                    className="w-full rounded border px-2 py-1 text-xs"
                                                    value={editForm.address.street}
                                                    onChange={(e) => handleEditFormChange("address.street", e.target.value)}
                                                />
                                                <div className="grid grid-cols-2 gap-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Дом"
                                                        className="w-full rounded border px-2 py-1 text-xs"
                                                        value={editForm.address.house}
                                                        onChange={(e) => handleEditFormChange("address.house", e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Квартира"
                                                        className="w-full rounded border px-2 py-1 text-xs"
                                                        value={editForm.address.apartment}
                                                        onChange={(e) => handleEditFormChange("address.apartment", e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Подъезд"
                                                        className="w-full rounded border px-2 py-1 text-xs"
                                                        value={editForm.address.entrance}
                                                        onChange={(e) => handleEditFormChange("address.entrance", e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Этаж"
                                                        className="w-full rounded border px-2 py-1 text-xs"
                                                        value={editForm.address.floor}
                                                        onChange={(e) => handleEditFormChange("address.floor", e.target.value)}
                                                    />
                                                </div>
                                                <label className="flex items-center gap-2 text-xs">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.address.isPrivateHouse}
                                                        onChange={(e) => handleEditFormChange("address.isPrivateHouse", e.target.checked)}
                                                    />
                                                    Частный дом
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="rounded-xl border bg-neutral-50 px-3 py-2">
                                    <div className="text-[11px] text-neutral-600 mb-1">Комментарий клиента</div>
                                    {!editMode ? (
                                        <div className="text-xs">{selected.comment || "—"}</div>
                                    ) : (
                                        <textarea
                                            className="mt-1 w-full rounded border px-2 py-1 text-xs"
                                            rows={3}
                                            placeholder="Комментарий к заказу"
                                            value={editForm.comment}
                                            onChange={(e) => handleEditFormChange("comment", e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Правая часть: суммы */}
                            <div className="rounded-xl border bg-neutral-50 px-3 py-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Товары</span>
                                    <span>{computedSubtotal} ₽</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Доставка</span>
                                    <span>{computedDelivery} ₽</span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold border-t pt-1 mt-1">
                                    <span>Итого</span>
                                    <span>{computedTotal} ₽</span>
                                </div>
                            </div>
                        </div>

                        {/* Позиции заказа */}
                        <div className="mt-4 rounded-2xl border bg-white">
                            <div className="border-b px-3 py-2 text-xs font-semibold">Состав заказа</div>

                            <div className="divide-y">
                                {orderItems.map((it, i) => {
                                    const imageUrl = getImageUrl(it.image);
                                    return (
                                        <div key={`${it.key}-${i}`} className="flex gap-3 p-3">
                                            {/* Изображение товара */}
                                            <div className="flex-shrink-0">
                                                <div className="h-16 w-16 overflow-hidden rounded-lg bg-neutral-100">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={it.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-full w-full place-items-center text-[10px] text-neutral-400">
                                                            фото
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Информация о товаре */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium">{it.name}</div>
                                                {it.weight && (
                                                    <div className="mt-0.5 text-[10px] text-neutral-500">
                                                        {it.weight}
                                                    </div>
                                                )}
                                                {it.composition && (
                                                    <div className="mt-1 text-[10px] text-neutral-600 line-clamp-2">
                                                        {it.composition}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Цена и количество */}
                                            <div className="flex flex-col items-end justify-between text-right gap-2">
                                                <div className="text-xs font-semibold">{it.lineTotal} ₽</div>

                                                {editMode ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            className="flex h-6 w-6 items-center justify-center rounded-full border bg-white text-sm hover:bg-neutral-50"
                                                            onClick={() => handleQuantityChange(i, -1)}
                                                            disabled={it.qty <= 1}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="min-w-[2rem] text-center text-xs font-medium">
                                                            {it.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="flex h-6 w-6 items-center justify-center rounded-full border bg-white text-sm hover:bg-neutral-50"
                                                            onClick={() => handleQuantityChange(i, 1)}
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-red-300 bg-red-50 text-xs text-red-600 hover:bg-red-100"
                                                            onClick={() => handleRemoveItem(i)}
                                                            title="Удалить"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-neutral-500">
                                                        {it.price} ₽ × {it.qty} шт
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {!orderItems.length && (
                                    <div className="px-3 py-6 text-center text-xs text-neutral-500">
                                        Нет позиций в заказе
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Debug на случай “пусто” из-за формата */}
                        {!orderItems.length && selected?.items?.length ? (
                            <pre className="mt-3 rounded-xl border bg-neutral-50 p-3 text-[10px] overflow-auto">
                {JSON.stringify(selected.items?.[0], null, 2)}
              </pre>
                        ) : null}
                    </div>
                </div>
            )}
        </section>
    );
}
