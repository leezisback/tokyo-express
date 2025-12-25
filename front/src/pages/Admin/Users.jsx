// src/pages/Admin/Users.jsx
import React, { useEffect, useState } from "react";
import {
    adminFetchUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";

export default function AdminUsersPage() {
    const { token } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        login: "",
        password: "",
        role: "admin",
        name: "",
    });
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    // Загрузка пользователей
    useEffect(() => {
        loadUsers();
    }, [token]);

    async function loadUsers() {
        if (!token) {
            setError("Нет токена авторизации");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await adminFetchUsers(token);
            setUsers(data || []);
        } catch (e) {
            console.error(e);
            setError(e.message || "Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    }

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({ login: "", password: "", role: "admin", name: "" });
        setSelectedUser(null);
        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode("edit");
        setFormData({
            login: user.login || "",
            password: "",
            role: user.role || "admin",
            name: user.name || "",
        });
        setSelectedUser(user);
        setFormError(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedUser(null);
        setFormError(null);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!token) return;

        if (!formData.login.trim()) {
            setFormError("Укажите логин");
            return;
        }

        if (modalMode === "create" && !formData.password.trim()) {
            setFormError("Укажите пароль");
            return;
        }

        try {
            setFormSaving(true);
            setFormError(null);

            const payload = {
                login: formData.login.trim(),
                role: formData.role,
                name: formData.name.trim(),
            };

            if (formData.password.trim()) {
                payload.password = formData.password.trim();
            }

            if (modalMode === "create") {
                await adminCreateUser(payload, token);
            } else {
                await adminUpdateUser(selectedUser._id, payload, token);
            }

            await loadUsers();
            closeModal();
        } catch (e) {
            console.error(e);
            setFormError(e.message || "Ошибка сохранения");
        } finally {
            setFormSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!token) return;
        if (!confirm("Удалить пользователя?")) return;

        try {
            await adminDeleteUser(userId, token);
            await loadUsers();
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка удаления");
        }
    };

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Пользователи</h2>
                <button
                    type="button"
                    className="rounded-xl bg-[var(--brand-rose)] px-4 py-2 text-sm font-semibold text-white shadow"
                    onClick={openCreateModal}
                >
                    + Создать пользователя
                </button>
            </div>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mb-3 text-sm text-neutral-600">
                    Загружаем пользователей...
                </div>
            )}

            {!loading && !error && (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50">
                                <th className="px-3 py-2 text-left">Логин</th>
                                <th className="px-3 py-2 text-left">Имя</th>
                                <th className="px-3 py-2 text-left">Роль</th>
                                <th className="px-3 py-2 text-left">Создан</th>
                                <th className="px-3 py-2 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="border-t hover:bg-neutral-50"
                                >
                                    <td className="px-3 py-2">{user.login}</td>
                                    <td className="px-3 py-2">{user.name || "—"}</td>
                                    <td className="px-3 py-2">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                                                user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-neutral-500">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString(
                                                  "ru-RU"
                                              )
                                            : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                className="rounded-full border px-3 py-1 text-xs hover:bg-neutral-50"
                                                onClick={() => openEditModal(user)}
                                            >
                                                Редактировать
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
                                                onClick={() => handleDelete(user._id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 py-6 text-center text-neutral-500"
                                    >
                                        Пользователей не найдено
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модалка создания/редактирования */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="modal w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                {modalMode === "create"
                                    ? "Создать пользователя"
                                    : "Редактировать пользователя"}
                            </h3>
                            <button
                                type="button"
                                className="rounded-full p-1 hover:bg-neutral-100"
                                onClick={closeModal}
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="block text-sm">
                                Логин
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border px-3 py-2"
                                    value={formData.login}
                                    onChange={(e) =>
                                        handleFormChange("login", e.target.value)
                                    }
                                    disabled={formSaving}
                                />
                            </label>

                            <label className="block text-sm">
                                Пароль
                                {modalMode === "edit" && (
                                    <span className="ml-1 text-xs text-neutral-500">
                                        (оставьте пустым, чтобы не менять)
                                    </span>
                                )}
                                <input
                                    type="password"
                                    className="mt-1 w-full rounded-xl border px-3 py-2"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleFormChange("password", e.target.value)
                                    }
                                    disabled={formSaving}
                                />
                            </label>

                            <label className="block text-sm">
                                Имя
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-xl border px-3 py-2"
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleFormChange("name", e.target.value)
                                    }
                                    disabled={formSaving}
                                />
                            </label>

                            <label className="block text-sm">
                                Роль
                                <select
                                    className="mt-1 w-full rounded-xl border px-3 py-2"
                                    value={formData.role}
                                    onChange={(e) =>
                                        handleFormChange("role", e.target.value)
                                    }
                                    disabled={formSaving}
                                >
                                    <option value="admin">Админ</option>
                                    <option value="manager">Менеджер</option>
                                </select>
                            </label>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                className="flex-1 rounded-xl bg-[var(--brand-rose)] px-4 py-2 font-semibold text-white shadow"
                                onClick={handleSubmit}
                                disabled={formSaving}
                            >
                                {formSaving ? "Сохранение..." : "Сохранить"}
                            </button>
                            <button
                                type="button"
                                className="rounded-xl border px-4 py-2"
                                onClick={closeModal}
                                disabled={formSaving}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
