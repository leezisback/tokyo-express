// src/pages/Promotions/index.jsx
import React, { useEffect, useState } from "react";
import { fetchPromotions } from "@/lib/api";

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function PromotionsPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchPromotions();
                setPromos(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setError("Не удалось загрузить акции");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-xl font-bold mb-4">Акции</h1>

            {loading && (
                <div className="text-sm text-neutral-600">
                    Загружаем актуальные предложения...
                </div>
            )}

            {error && (
                <div className="text-sm text-red-600 mb-4">{error}</div>
            )}

            {!loading && !error && promos.length === 0 && (
                <div className="text-sm text-neutral-600">
                    Сейчас нет активных акций.
                </div>
            )}

            {!loading && !error && promos.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {promos.map((p) => {
                        const hasDiscount =
                            typeof p.discountPercent === "number" &&
                            p.discountPercent > 0;
                        const hasMinTotal =
                            typeof p.minOrderTotal === "number" &&
                            p.minOrderTotal > 0;

                        return (
                            <article
                                key={p._id}
                                className="rounded-2xl border shadow-sm bg-white p-4 flex flex-col gap-2"
                            >
                                <h2 className="text-lg font-semibold">
                                    {p.title}
                                </h2>

                                {p.description && (
                                    <p className="text-sm text-neutral-700">
                                        {p.description}
                                    </p>
                                )}

                                {(hasDiscount || hasMinTotal) && (
                                    <div className="mt-1 text-sm font-semibold text-[#E42226]">
                                        {hasDiscount && (
                                            <span>
                                                –{p.discountPercent}%{" "}
                                            </span>
                                        )}
                                        {hasMinTotal && (
                                            <span>
                                                при заказе от {p.minOrderTotal}
                                                ₽
                                            </span>
                                        )}
                                    </div>
                                )}

                                {(p.activeFrom || p.activeTo) && (
                                    <div className="mt-1 text-xs text-neutral-500">
                                        {p.activeFrom && (
                                            <span>
                                                c {formatDate(p.activeFrom)}{" "}
                                            </span>
                                        )}
                                        {p.activeTo && (
                                            <span>
                                                по {formatDate(p.activeTo)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
