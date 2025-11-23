// src/components/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function AdminLayout() {
    const { user, logout } = useAuth();

    const linkBase =
        "px-3 py-2 text-sm font-medium rounded-lg hover:bg-neutral-100";
    const linkClass = ({ isActive }) =>
        `${linkBase} ${isActive ? "bg-neutral-200" : ""}`;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Верхняя панель админки */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-neutral-500">Админ-панель</span>
                    <span className="text-neutral-400">/</span>
                    <span className="text-neutral-800">
                        Токио Экспресс
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {user && (
                        <div className="text-xs text-neutral-600">
                            Вошли как{" "}
                            <span className="font-semibold">
                                {user.login}
                            </span>{" "}
                            ({user.role})
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={logout}
                        className="rounded-full border px-3 py-1 text-xs hover:bg-neutral-100"
                    >
                        Выйти
                    </button>
                </div>
            </div>

            {/* Меню админки */}
            <nav className="mb-5 flex flex-wrap gap-2">
                <NavLink to="/admin/menu" className={linkClass}>
                    Меню
                </NavLink>
                <NavLink to="/admin/stats" className={linkClass}>
                    Статистика
                </NavLink>
                <NavLink to="/admin/orders" className={linkClass}>
                    Заказы
                </NavLink>
                <NavLink
                    to="/admin/promotions"
                    className={linkClass}
                >
                    Акции
                </NavLink>
            </nav>

            {/* Контент конкретной вкладки */}
            <Outlet />
        </div>
    );
}
