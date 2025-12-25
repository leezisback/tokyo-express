import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Панель категорий:
 * - tabs: "Все" + категории из backend
 * - справа горизонтальные табы
 * - слева — кнопка "Все категории ▾" с дропдауном
 */
export default function CategoryBar({ active, setActive, categories = [] }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    // закрытие дропдауна по клику снаружи
    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const tabs = useMemo(() => {
        const base = (categories || []).map((c) => ({
            key: c.slug || c.key || String(c._id),
            label: c.name || c.label,
        }));
        // "Все" как отдельный таб
        return [ ...base];
    }, [categories]);

    const tabBase =
        "-mb-0.5 border-b-2 pb-2 text-base font-semibold transition select-none text-center w-full";
    const tabClass = (isActive) =>
        `${tabBase} ${
            isActive
                ? "border-black text-black"
                : "border-transparent text-black/60 hover:text-black"
        }`;

    const handleSelect = (key) => {
        if (typeof setActive === "function") {
            setActive(key);
        }
        setOpen(false);
    };

    return (
        <div
            id="menu"
            className="relative mx-auto max-w-6xl px-4"
            ref={wrapRef}
        >
            <div className="flex w-full items-center gap-4">
                {/* Кнопка дропдауна со всеми категориями */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="rounded-xl bg-neutral-100 px-3 py-2 text-sm shadow-sm"
                    >
                        Все категории ▾
                    </button>

                    {open && (
                        <div
                            className="absolute z-50 mt-2 w-64 max-h-[70vh] overflow-auto rounded-2xl bg-white p-2 text-[15px] shadow-2xl ring-1 ring-black/5"
                            role="menu"
                        >
                            <ul className="space-y-1">
                                {tabs.map((t) => (
                                    <li key={t.key}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(t.key)}
                                            className={`w-full text-left rounded-lg px-3 py-2 hover:bg-neutral-100 ${
                                                active === t.key
                                                    ? "font-semibold"
                                                    : ""
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Горизонтальные табы */}
                {tabs.map((c) => (
                    <div key={c.key} className="hidden flex-1 sm:block">
                        <button
                            type="button"
                            onClick={() => handleSelect(c.key)}
                            className={tabClass(active === c.key)}
                        >
                            {c.label}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
