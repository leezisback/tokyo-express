import React, { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_TABS, CATEGORY_DROPDOWN } from "../lib/mock";

export default function CategoryBar({ active, setActive }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const LABEL_TO_KEY = useMemo(
        () => Object.fromEntries(CATEGORY_TABS.map((t) => [t.label, t.key])),
        []
    );

    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const selectLabel = (label) => {
        const key = LABEL_TO_KEY[label] ?? "all";
        setActive(key);
        setOpen(false);
    };

    const tabBase =
        "-mb-0.5 border-b-2 pb-2 text-base font-semibold transition select-none text-center w-full";
    const tabClass = (isActive) =>
        `${tabBase} ${isActive ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`;

    return (
        <div id="menu" className="mx-auto max-w-6xl px-4 relative" ref={wrapRef}>
            {/* ряд табов растянут на всю ширину */}
            <div className="flex w-full items-center gap-4">
                {/* Меню с дропдауном — тоже занимает долю ширины */}
                <div className="relative flex">

                    {open && (
                        <div
                            onMouseLeave={() => setOpen(false)}
                            className="absolute inset-x-0 top-full mt-2 z-50 rounded-2xl bg-white p-2 text-[15px] shadow-2xl ring-1 ring-black/5 max-h-[70vh] overflow-auto"
                            role="menu"
                        >
                            <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {CATEGORY_DROPDOWN.map((it) => (
                                    <button
                                        key={it}
                                        onClick={() => selectLabel(it)}
                                        className="text-left rounded-lg px-3 py-2 hover:bg-neutral-100"
                                        role="menuitem"
                                    >
                                        {it}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Остальные табы — равные доли по ширине */}
                {CATEGORY_TABS.map((c) => (
                    <div key={c.key} className="flex-1">
                        <button
                            onClick={() => setActive(c.key)}
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
