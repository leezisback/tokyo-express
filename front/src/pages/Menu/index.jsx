// src/pages/Menu/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import CategoryBar from "@/components/CategoryBar";
import { fetchCategories, fetchProducts } from "@/lib/api";

export default function MenuPage() {
    const [searchParams] = useSearchParams();
    const initialCat = searchParams.get("cat") || "all";
    const searchQuery = (searchParams.get("q") || "")
        .trim()
        .toLowerCase();

    const [active, setActive] = useState(initialCat);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [cats, prods] = await Promise.all([
                    fetchCategories(),
                    fetchProducts({}),
                ]);

                const normCats = (cats || []).map((c) => ({
                    ...c,
                    id: c._id,
                    key: c.slug || String(c._id),
                    label: c.name,
                }));

                const normProducts = (prods || []).map((p) => ({
                    ...p,
                    id: p._id,
                    categorySlug: p.category?.slug || "",
                }));

                setCategories(normCats);
                setProducts(normProducts);

                if (
                    initialCat !== "all" &&
                    normCats.some((c) => c.key === initialCat)
                ) {
                    setActive(initialCat);
                } else {
                    setActive("all");
                }
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки меню");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [initialCat]);

    const filtered = useMemo(() => {
        let list = Array.isArray(products) ? [...products] : [];

        // фильтр по категории
        if (active && active !== "all") {
            list = list.filter(
                (p) =>
                    (p.categorySlug || p.category?.slug || "") === active,
            );
        }

        // фильтр по поиску
        if (searchQuery) {
            list = list.filter((p) => {
                const name = (p.name || "").toLowerCase();
                const desc = (p.description || "").toLowerCase();
                return (
                    name.includes(searchQuery) ||
                    desc.includes(searchQuery)
                );
            });
        }

        return list;
    }, [products, active, searchQuery]);

    return (
        <section className="max-w-6xl mx-auto px-4 py-6">
            <CategoryBar
                active={active}
                setActive={setActive}
                categories={categories}
            />

            {loading && (
                <div className="mt-6 text-sm text-neutral-600">
                    Загрузка меню...
                </div>
            )}
            {error && (
                <div className="mt-6 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((p) => (
                        <article
                            key={p.id || p._id}
                            className="rounded-2xl border shadow-sm overflow-hidden"
                        >
                            <img
                                src={p.image}
                                alt={p.name}
                                className="w-full aspect-[4/3] object-contain bg-white"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="p-3">
                                <h3 className="font-semibold text-sm">
                                    {p.name}
                                </h3>
                                {p.weight && (
                                    <div className="mt-1 text-xs text-black/60">
                                        {p.weight}
                                    </div>
                                )}
                                <div className="mt-1 text-base font-bold">
                                    {p.price} ₽
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
