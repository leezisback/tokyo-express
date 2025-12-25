// src/pages/Home/index.jsx
import React, { useEffect, useState } from "react";

import { fetchCategories, fetchProducts, createOrder } from "@/lib/api";
import Hero from "@/components/Hero.jsx";
import QuickLinks from "@/components/QuickLinks.jsx";
import CategoryBar from "@/components/CategoryBar.jsx";
import ProductsGrid from "@/components/ProductsGrid.jsx";
import WhyUs from "@/components/WhyUs.jsx";
import Contacts from "@/pages/Contacts/index.jsx";
import ProductModal from "@/components/ProductModal.jsx";
import CartSheet from "@/components/CartSheet.jsx";
import CheckoutModal from "@/components/CheckoutModal.jsx";

export default function HomePage() {
    const [active, setActive] = useState("all");
    const [cart, setCart] = useState([]);
    const [product, setProduct] = useState(null);
    const [openCart, setOpenCart] = useState(false);
    const [openCheckout, setOpenCheckout] = useState(false);

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // загрузка категорий и товаров с backend
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [cats, prods] = await Promise.all([
                    fetchCategories(),
                    fetchProducts({}),
                ]);

                const normCats = (cats || []).map((c) => ({
                    ...c,
                    id: c._id,
                    key: c.slug || String(c._id),
                    label: c.name,
                }));

                const normProducts = (prods || []).map((p) => ({
                    ...p,
                    id: p._id,
                    categorySlug: p.category?.slug || "",
                }));

                setCategories(normCats);
                setProducts(normProducts);

                if (normCats.some((c) => c.key === "baked")) {
                    setActive("baked");
                } else {
                    setActive("all");
                }
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки меню");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // быстрый заказ: добавить товар в корзину и открыть оформление
    const quickOrder = (p) => {
        if (!p) return;
        setCart((c) => {
            const ex = c.find((x) => x.id === p.id);
            if (ex) {
                return c.map((x) =>
                    x.id === p.id ? { ...x, qty: x.qty + 1 } : x
                );
            }
            return [
                ...c,
                { id: p.id, name: p.name, price: p.price, qty: 1 },
            ];
        });
        setOpenCheckout(true);
    };

    // отправка заказа на backend
    const handleSubmitOrder = async (mode, form) => {
        try {
            setOrderLoading(true);
            setOrderError(null);

            const items = cart.map((i) => ({
                product: i.id,     // ObjectId товара в Mongo
                name: i.name,
                price: i.price,
                qty: i.qty,
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
                // deliveryPrice/total пусть считает backend по своей логике
            };

            await createOrder(payload);

            // успех: чистим корзину, закрываем модалку
            setCart([]);
            setOpenCheckout(false);
            alert("Заказ успешно оформлен! Мы скоро вам перезвоним.");
        } catch (e) {
            console.error(e);
            setOrderError("Ошибка при оформлении заказа. Попробуйте ещё раз.");
            // пробрасываем ошибку, чтобы CheckoutModal тоже мог её отловить
            throw e;
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            {/* Модалки */}
            <ProductModal
                product={product}
                open={!!product}
                onClose={() => setProduct(null)}
                onAdd={quickOrder}
            />

            <CartSheet
                open={openCart}
                onClose={() => setOpenCart(false)}
                cart={cart}
                setCart={setCart}
                onCheckout={() => {
                    setOpenCart(false);
                    setOpenCheckout(true);
                }}
            />

            <CheckoutModal
                open={openCheckout}
                onClose={() => setOpenCheckout(false)}
                cart={cart}
                onSubmit={handleSubmitOrder}
                loading={orderLoading}
                error={orderError}
            />

            {/* Контент */}


            <Hero />

            {!loading && !error && (
                <QuickLinks
                    categories={categories}
                    onCategoryClick={setActive}
                />
            )}

            {loading && (
                <div className="mt-6 text-sm text-neutral-600">
                    Загрузка меню...
                </div>
            )}
            {error && (
                <div className="mt-6 text-sm text-red-600">{error}</div>
            )}
            <div id="menu">
                <CategoryBar
                    active={active}
                    setActive={setActive}
                    categories={categories}
                />
            </div>
            {!loading && !error && (
                <ProductsGrid
                    active={active}
                    products={products}
                    onAdd={quickOrder}
                    onOpen={setProduct}
                />
            )}

            <WhyUs />
            <Contacts />
        </section>
    );
}
