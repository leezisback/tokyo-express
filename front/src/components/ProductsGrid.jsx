// src/components/ProductsGrid.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS, CATEGORY_TABS } from "../lib/mock";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
    { key: "price_desc", label: "По убыванию цены" },
    { key: "price_asc",  label: "По возрастанию цены" },
    { key: "popular",    label: "По популярности" },
    { key: "new",        label: "По новизне" },
];

export default function ProductsGrid({ active = "all", setActive, onAdd, onOpen }) {
    const [openFilter, setOpenFilter] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [sort, setSort] = useState("price_desc");

    const wrapRef = useRef(null);
    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) {
                setOpenFilter(false);
                setOpenSort(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const onPickCategory = (key) => {
        if (typeof setActive === "function") setActive(key);
        else console.warn("[ProductsGrid] setActive не передан — фильтр категорий не применён");
        setOpenFilter(false);
    };

    const sortedFiltered = useMemo(() => {
        // Фильтрация по категории
        let list =
            !active || active === "all"
                ? PRODUCTS.slice()
                : PRODUCTS.filter((p) => p.category === active);

        // Сортировка
        switch (sort) {
            case "price_asc":
                list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                break;
            case "price_desc":
                list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
                break;
            case "popular":
                list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
                break;
            case "new":
                // если нет createdAt — используем id как прокси
                const getNewScore = (p) => {
                    if (p.createdAt) return +new Date(p.createdAt);
                    const num = Number(p.id);
                    return Number.isFinite(num) ? num : 0;
                };
                list.sort((a, b) => getNewScore(b) - getNewScore(a));
                break;
            default:
                break;
        }
        return list;
    }, [active, sort]);

    const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Сортировка";

    return (
        <div ref={wrapRef} className="mx-auto mt-6 max-w-6xl px-4">
            {/* Панель: Фильтр + Сортировка */}
            <div className="mb-4 flex items-center gap-4 relative">
                {/* Фильтр */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setOpenFilter((v) => !v);
                            setOpenSort(false);
                        }}
                        className="rounded-xl bg-neutral-100 px-3 py-2 text-sm shadow-sm"
                    >
                        Фильтр ▾
                    </button>

                    {openFilter && (
                        <div
                            className="absolute z-50 mt-2 w-56 rounded-2xl bg-white p-2 text-[15px] shadow-xl ring-1 ring-black/5"
                            role="menu"
                        >
                            <ul className="max-h-[70vh] overflow-auto">
                                {[
                                    { key: "all", label: "Все" },
                                    ...CATEGORY_TABS.map((t) => ({ key: t.key, label: t.label })),
                                ].map((it) => (
                                    <li key={it.key}>
                                        <button
                                            onClick={() => onPickCategory(it.key)}
                                            className={`w-full text-left rounded-lg px-3 py-2 hover:bg-neutral-100 ${
                                                active === it.key ? "font-semibold" : ""
                                            }`}
                                        >
                                            {it.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Сортировка */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setOpenSort((v) => !v);
                            setOpenFilter(false);
                        }}
                        className="rounded-xl bg-neutral-100 px-3 py-2 text-sm shadow-sm"
                    >
                        Сортировка ▾
                    </button>

                    {openSort && (
                        <div
                            className="absolute z-50 mt-2 w-64 rounded-2xl bg-white p-2 text-[15px] shadow-xl ring-1 ring-black/5"
                            role="menu"
                        >
                            <ul>
                                {SORT_OPTIONS.map((opt) => (
                                    <li key={opt.key}>
                                        <button
                                            onClick={() => {
                                                setSort(opt.key);
                                                setOpenSort(false);
                                            }}
                                            className={`w-full text-left rounded-lg px-3 py-2 hover:bg-neutral-100 ${
                                                sort === opt.key ? "font-semibold" : ""
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* счётчик справа */}
                <span className="ml-auto text-sm text-black/60">Найдено: {sortedFiltered.length}</span>
            </div>

            {/* Сетка карточек */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {sortedFiltered.map((p) => (
                    <ProductCard key={p.id} p={p} onAdd={onAdd} onOpen={onOpen} />
                ))}
            </div>
        </div>
    );
}
