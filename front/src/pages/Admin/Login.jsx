// src/pages/Admin/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";

export default function AdminLoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { login: saveAuth } = useAuth();

    const from = location.state?.from?.pathname || "/admin";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!login.trim() || !password) {
            setError("Введите логин и пароль");
            return;
        }

        try {
            setLoading(true);
            const data = await loginAdmin({
                login: login.trim(),
                password,
            });
            saveAuth(data);
            navigate(from, { replace: true });
        } catch (e) {
            console.error(e);
            setError(e.message || "Ошибка авторизации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-md mx-auto px-4 py-10">
            <h1 className="mb-4 text-xl font-bold">
                Вход в админ-панель
            </h1>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border"
            >
                <label className="block text-sm">
                    Логин
                    <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        autoComplete="username"
                    />
                </label>
                <label className="block text-sm">
                    Пароль
                    <input
                        type="password"
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        autoComplete="current-password"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[var(--brand-rose)] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-70"
                >
                    {loading ? "Входим..." : "Войти"}
                </button>
            </form>
        </section>
    );
}
