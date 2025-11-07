import React, { useState } from "react";

import Hero from "@/components/Hero.jsx";
import CategoryBar from "@/components/CategoryBar.jsx";
import ProductsGrid from "@/components/ProductsGrid.jsx";
import WhyUs from "@/components/WhyUs.jsx";
import Contacts from "@/pages/Contacts/index.jsx";
import ProductModal from "@/components/ProductModal.jsx";
import CartSheet from "@/components/CartSheet.jsx";
import CheckoutModal from "@/components/CheckoutModal.jsx";

export default function HomePage() {
    const [active, setActive] = useState("baked");
    const [cart, setCart] = useState([]);
    const [product, setProduct] = useState(null);
    const [openCart, setOpenCart] = useState(false);
    const [openCheckout, setOpenCheckout] = useState(false);


    // быстрый заказ: добавить и сразу открыть оформление
    const quickOrder = (p) => {
        setCart((c) => {
            const ex = c.find((x) => x.id === p.id);
            return ex ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
                : [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
        });
        setOpenCheckout(true);
    };

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            {/* Модалки */}
            <ProductModal
                product={product}
                open={!!product}
                onClose={() => setProduct(null)}
                onAdd={quickOrder}            // из модалки → сразу оформить
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
            <CheckoutModal open={openCheckout} onClose={() => setOpenCheckout(false)} />

            {/* Контент */}
            <CategoryBar active={active} setActive={setActive} />
            <Hero />

            <ProductsGrid
                active={active}
                onAdd={quickOrder}            // клик на "+" → быстрый заказ
                onOpen={setProduct}           // клик на "Подробнее" → модалка товара
            />

            <WhyUs />
            <Contacts />
        </section>
    );
}
