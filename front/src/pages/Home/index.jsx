// src/pages/Home/index.jsx
import React, { useEffect, useState } from "react";

import { fetchCategories, fetchProducts, createOrder } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import Hero from "@/components/Hero.jsx";
import CategoryBar from "@/components/CategoryBar.jsx";
import ProductsGrid from "@/components/ProductsGrid.jsx";
import WhyUs from "@/components/WhyUs.jsx";
import Contacts from "@/pages/Contacts/index.jsx";
import ProductModal from "@/components/ProductModal.jsx";
import CartSheet from "@/components/CartSheet.jsx";
import CheckoutModal from "@/components/CheckoutModal.jsx";

export default function HomePage() {
    const { cart, addToCart, clearCart } = useCart();

    const [active, setActive] = useState("all");
    const [product, setProduct] = useState(null);
    const [openCart, setOpenCart] = useState(false);
    const [openCheckout, setOpenCheckout] = useState(false);

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts({})]);

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

                if (normCats.some((c) => c.key === "baked")) setActive("baked");
                else setActive("all");
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки меню");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // ✅ НОРМАЛЬНОЕ добавление: открываем корзину
    const addAndOpenCart = (p) => {
        if (!p) return;
        addToCart(p);
        setOpenCart(true);
    };

    // ✅ Быстрый заказ (если где-то нужен отдельно): сразу оформление
    const quickOrder = (p) => {
        if (!p) return;
        addToCart(p);
        setOpenCheckout(true);
    };

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
                mode,
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
        <section className="mx-auto max-w-7xl px-4 py-6">
            {/* Модалки */}
            <ProductModal
                product={product}
                open={!!product}
                onClose={() => setProduct(null)}
                // было: onAdd={quickOrder}
                onAdd={addAndOpenCart}
            />

            <CartSheet
                open={openCart}
                onClose={() => setOpenCart(false)}
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

            <hr/>
            {loading && <div className="mt-6 text-sm text-neutral-600">Загрузка меню...</div>}
            {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

            <div id="menu" style={{ marginTop: "2rem" }} className="flex justify-center">
                <CategoryBar active={active} setActive={setActive} categories={categories} />
            </div>

            {!loading && !error && (
                <ProductsGrid
                    active={active}
                    products={products}
                    // было: onAdd={quickOrder}
                    onAdd={addAndOpenCart}
                    onOpen={setProduct}
                />
            )}

            <WhyUs />
            <Contacts />
        </section>
    );
}
