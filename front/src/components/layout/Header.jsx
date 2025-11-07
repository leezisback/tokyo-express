import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "@/assets/images/logo.png";

const dropdown = [
    { to: "/menu?cat=classic", label: "Классические роллы" },
    { to: "/menu?cat=baked",   label: "Запеченные роллы" },
    { to: "/menu?cat=sushi",   label: "Суши" },
    { to: "/menu?cat=sashimi", label: "Сашими" },
    { to: "/menu?cat=wok",     label: "WOK-лапша" },
    { to: "/menu?cat=soups",   label: "Супы" },
    { to: "/menu?cat=salads",  label: "Салаты" },
    { to: "/menu?cat=drinks",  label: "Напитки" },
    { to: "/promotions",       label: "Акции" },
    { to: "/menu",             label: "Все" },
];

export default function Header({ onOpenCart }) {
    const [q, setQ] = useState("");

    const onSearch = (e) => {
        e.preventDefault();
        const url = q.trim() ? `/menu?q=${encodeURIComponent(q)}` : "/menu";
        window.location.assign(url);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white">
            {/* Верхняя розовая полоска */}
            <div className="bg-[var(--brand-rose)] text-black">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[15px]">
                    <nav className="flex items-center gap-6 text-[13px] leading-[100%]">
                        {/* Пункт «Меню» с выпадающим списком */}
                        <div className="relative group">
                            <NavLink to="/menu" className="hover:underline">Меню</NavLink>
                            {/* Дропдаун */}
                            <div
                                className="
                  invisible opacity-0 group-hover:visible group-hover:opacity-100
                  group-focus-within:visible group-focus-within:opacity-100
                  absolute left-0 mt-2 w-56 rounded-lg bg-white shadow-xl ring-1 ring-black/5
                  transition-opacity duration-150 z-50
                "
                            >
                                <ul className="max-h-[70vh] overflow-auto py-2">
                                    {dropdown.map((item) => (
                                        <li key={item.to}>
                                            <NavLink
                                                to={item.to}
                                                className="block px-4 py-2 text-[14px] leading-[100%] hover:bg-neutral-100"
                                            >
                                                {item.label}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                                {/* маленький «хвостик» */}
                                <div className="absolute -top-2 left-6 h-3 w-3 rotate-45 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/5" />
                            </div>
                        </div>

                        <NavLink to="/admin/stats" className="hover:underline">Преимущества</NavLink>
                        <NavLink to="/contacts" className="hover:underline">Контакты</NavLink>
                    </nav>

                    <a href="tel:+79967898585" className="text-[13px] font-semibold">7 (996) 789 - 85 - 85</a>
                </div>
            </div>

            {/* Логотип — Поиск — Корзина */}
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
                <NavLink to="/" className="shrink-0 leading-none">
                    <img
                        src={logo}
                        alt="Токио экспресс"
                        className="h-[100px] w-auto md:h-[90px]"
                        loading="eager"
                        decoding="async"
                    />
                </NavLink>

                {/* ОДНО поле поиска (убрали дубликат) */}
                <form onSubmit={onSearch} className="flex-1">
                    <label className="group flex h-10 w-full items-center rounded-[12px] bg-[#D9D9D9] px-3">
                        <svg
                            className="h-4 w-4 opacity-60"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Поиск"
                            className="w-full bg-transparent px-2 text-[16px] leading-[100%] outline-none"
                        />
                    </label>
                </form>

                <button
                    type="button"
                    onClick={onOpenCart}
                    className="rounded-lg p-2 hover:bg-neutral-100"
                    aria-label="Открыть корзину"
                >
                    {/* простая иконка корзины */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-90">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
