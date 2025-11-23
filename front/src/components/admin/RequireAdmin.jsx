// src/components/admin/RequireAdmin.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function RequireAdmin() {
    const { isAuthenticated, ready } = useAuth();
    const location = useLocation();

    // пока не прочитали localStorage — ничего не делаем
    if (!ready) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-neutral-600">
                Проверяем авторизацию...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
}
