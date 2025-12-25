// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "@/components/layout/Header.jsx";
import Footer from "@/components/layout/Footer.jsx";

import HomePage from "@/pages/Home";
import MenuPage from "@/pages/Menu";
import CheckoutPage from "@/pages/Checkout";
import ContactsPage from "@/pages/Contacts";
import PromotionsPage from "@/pages/Promotions";

// корзина/оформление
import CartSheet from "@/components/CartSheet.jsx";
import CheckoutModal from "@/components/CheckoutModal.jsx";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api";

// админка
import AdminLoginPage from "@/pages/Admin/Login.jsx";
import AdminDashboardPage from "@/pages/Admin/Dashboard.jsx";
import AdminMenuPage from "@/pages/Admin/Menu.jsx";
import AdminOrdersPage from "@/pages/Admin/Orders.jsx";
import AdminPromotionsPage from "@/pages/Admin/Promotions.jsx";
import AdminStatsPage from "@/pages/Admin/Stats.jsx";
import AdminUsersPage from "@/pages/Admin/Users.jsx";

import RequireAdmin from "@/components/admin/RequireAdmin.jsx";
import AdminLayout from "@/components/admin/AdminLayout.jsx";

export default function App() {
    const { cart, clearCart } = useCart();

    const [openCart, setOpenCart] = useState(false);
    const [openCheckout, setOpenCheckout] = useState(false);

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);

    const handleSubmitOrder = async (mode, form) => {
        try {
            setOrderLoading(true);
            setOrderError(null);

            const items = cart.map((item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                qty: item.qty,
                image: item.image,
                weight: item.weight,
                composition: item.composition,
            }));

            const payload = {
                items,
                mode, // "delivery" | "pickup"
                address:
                    mode === "delivery"
                        ? {
                            street: form.street,
                            house: form.house,
                            entrance: form.entrance,
                            floor: form.floor,
                            apartment: form.apartment,
                            isPrivateHouse: form.isPrivateHouse,
                        }
                        : {},
                phone: form.phone.trim(),
                comment: form.comment || "",
            };

            const order = await createOrder(payload);

            clearCart();
            setOpenCheckout(false);

            const orderNum = order.shortId || order._id?.slice(-6) || "???";
            alert(`Заказ №${orderNum} успешно оформлен! Мы скоро вам перезвоним.`);
        } catch (e) {
            console.error(e);
            setOrderError(e.message || "Ошибка при оформлении заказа. Попробуйте ещё раз.");
            throw e;
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col">
            <Header onOpenCart={() => setOpenCart(true)} />

            {/* ✅ Глобальная корзина (работает на любой странице) */}
            <CartSheet
                open={openCart}
                onClose={() => setOpenCart(false)}
                onCheckout={() => {
                    setOpenCart(false);
                    setOpenCheckout(true);
                }}
            />

            {/* ✅ Глобальное оформление */}
            <CheckoutModal
                open={openCheckout}
                onClose={() => setOpenCheckout(false)}
                cart={cart}
                onSubmit={handleSubmitOrder}
                loading={orderLoading}
                error={orderError}
            />

            <main className="flex-1">
                <Routes>
                    {/* Публичные страницы */}
                    <Route path="/" element={<HomePage onOpenCart={() => setOpenCart(true)} />} />
                    <Route path="/menu" element={<MenuPage onOpenCart={() => setOpenCart(true)} />} />
                    <Route path="/promotions" element={<PromotionsPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />

                    {/* Админ */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    <Route element={<RequireAdmin />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboardPage />} />
                            <Route path="/admin/menu" element={<AdminMenuPage />} />
                            <Route path="/admin/orders" element={<AdminOrdersPage />} />
                            <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
                            <Route path="/admin/stats" element={<AdminStatsPage />} />
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                        </Route>
                    </Route>
                </Routes>
            </main>

            <Footer />
        </div>
    );
}
