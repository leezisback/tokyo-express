// src/pages/Menu/index.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import CategoryBar from "@/components/CategoryBar";
import ProductsGrid from "@/components/ProductsGrid";

// + то же, что на Home
import { fetchCategories, fetchProducts, createOrder } from "@/lib/api";
import ProductModal from "@/components/ProductModal.jsx";
import CartSheet from "@/components/CartSheet.jsx";
import CheckoutModal from "@/components/CheckoutModal.jsx";

export default function MenuPage() {
    const [searchParams] = useSearchParams();
    const initialCat = searchParams.get("cat") || "all";

    const [active, setActive] = useState(initialCat);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // корзина + модалки (как на Home)
    const [cart, setCart] = useState([]);
    const [product, setProduct] = useState(null);
    const [openCart, setOpenCart] = useState(false);
    const [openCheckout, setOpenCheckout] = useState(false);

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);

    useEffect(() => {
        let cancelled = false;

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

                if (!cancelled) {
                    setCategories(normCats);
                    setProducts(normProducts);

                    if (initialCat !== "all" && normCats.some((c) => c.key === initialCat)) {
                        setActive(initialCat);
                    } else {
                        setActive("all");
                    }
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) setError("Ошибка загрузки меню");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [initialCat]);

    // добавить в корзину и открыть оформление (как Home)
    const quickOrder = (p) => {
        if (!p) return;

        const pid = String(p.id ?? p._id ?? "");
        if (!pid) return;

        const price = Number(p.price ?? 0);

        setCart((c) => {
            const ex = c.find((x) => String(x.id) === pid);
            if (ex) {
                return c.map((x) =>
                    String(x.id) === pid ? { ...x, qty: (x.qty ?? 0) + 1 } : x
                );
            }
            return [...c, { id: pid, name: p.name ?? "", price, qty: 1 }];
        });

        setOpenCheckout(true);
    };

    // отправка заказа на backend (копия логики Home)
    const handleSubmitOrder = async (mode, form) => {
        try {
            setOrderLoading(true);
            setOrderError(null);

            const items = cart.map((i) => ({
                product: i.id,
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
            };

            await createOrder(payload);

            setCart([]);
            setOpenCheckout(false);
            alert("Заказ успешно оформлен! Мы скоро вам перезвоним.");
        } catch (e) {
            console.error(e);
            setOrderError("Ошибка при оформлении заказа. Попробуйте ещё раз.");
            throw e;
        } finally {
            setOrderLoading(false);
        }
    };

    const itemsCount = cart.reduce((s, x) => s + (Number(x.qty) || 0), 0);

    return (
        <section className="max-w-6xl mx-auto px-4 py-6">
            {/* Модалки заказа (как Home) */}
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

            <CategoryBar active={active} setActive={setActive} categories={categories} />

            {loading && (
                <div className="mt-6 text-sm text-neutral-600">Загрузка меню...</div>
            )}

            {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

            {!loading && !error && (
                <ProductsGrid
                    active={active}
                    products={products}
                    onAdd={quickOrder}
                    onOpen={setProduct}
                />
            )}

            {/* Кнопка корзины (чтобы можно было открыть и поправить количество) */}
            {itemsCount > 0 && (
                <button
                    type="button"
                    onClick={() => setOpenCart(true)}
                    className="fixed bottom-4 right-4 z-40 rounded-2xl bg-black px-4 py-3 text-white shadow-lg hover:opacity-90"
                >
                    Корзина • {itemsCount}
                </button>
            )}
        </section>
    );
}
