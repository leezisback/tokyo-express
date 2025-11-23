// src/App.jsx
import { Routes, Route } from "react-router-dom";

import Header from "@/components/layout/Header.jsx";
import Footer from "@/components/layout/Footer.jsx";

import HomePage from "@/pages/Home";
import MenuPage from "@/pages/Menu";
import CheckoutPage from "@/pages/Checkout";
import ContactsPage from "@/pages/Contacts";
import PromotionsPage from "@/pages/Promotions";

// админка
import AdminLoginPage from "@/pages/Admin/Login.jsx";
import AdminDashboardPage from "@/pages/Admin/Dashboard.jsx";
import AdminMenuPage from "@/pages/Admin/Menu.jsx";
import AdminOrdersPage from "@/pages/Admin/Orders.jsx";
import AdminPromotionsPage from "@/pages/Admin/Promotions.jsx";
import AdminStatsPage from "@/pages/Admin/Stats.jsx";

import RequireAdmin from "@/components/admin/RequireAdmin.jsx";
import AdminLayout from "@/components/admin/AdminLayout.jsx";

export default function App() {
    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="flex-1">
                <Routes>
                    {/* Публичные страницы */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route
                        path="/promotions"
                        element={<PromotionsPage />}
                    />
                    <Route
                        path="/checkout"
                        element={<CheckoutPage />}
                    />
                    <Route
                        path="/contacts"
                        element={<ContactsPage />}
                    />

                    {/* Логин в админку (отдельно, без RequireAdmin) */}
                    <Route
                        path="/admin/login"
                        element={<AdminLoginPage />}
                    />

                    {/* Все защищённые админ-роуты */}
                    <Route element={<RequireAdmin />}>
                        <Route element={<AdminLayout />}>
                            <Route
                                path="/admin"
                                element={<AdminDashboardPage />}
                            />
                            <Route
                                path="/admin/menu"
                                element={<AdminMenuPage />}
                            />
                            <Route
                                path="/admin/orders"
                                element={<AdminOrdersPage />}
                            />
                            <Route
                                path="/admin/promotions"
                                element={<AdminPromotionsPage />}
                            />
                            <Route
                                path="/admin/stats"
                                element={<AdminStatsPage />}
                            />
                        </Route>
                    </Route>
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
