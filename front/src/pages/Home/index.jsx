import React, { useState } from "react";

// Если у тебя настроен alias "@", оставляй так:
import Hero from "@/components/Hero.jsx";
import CategoryBar from "@/components/CategoryBar.jsx";
import ProductsGrid from "@/components/ProductsGrid.jsx";
import WhyUs from "@/components/WhyUs.jsx";
import Contacts from "@/pages/Contacts/index.jsx";

// Если alias не настроен — замени на относительные пути, например:
// import Hero from "../components/Hero.jsx";
// import CategoryBar from "../components/CategoryBar.jsx";
// import PromoBanner from "../components/PromoBanner.jsx";
// import ProductsGrid from "../components/ProductsGrid.jsx";
// import WhyUs from "../components/WhyUs.jsx";
// import Contacts from "../pages/Contacts/index.jsx";

export default function HomePage() {
    // локальный стейт под предпросмотр (чтобы не тянуть контекст)
    const [active, setActive] = useState("baked");
    const [cart, setCart] = useState([]);
    const [product, setProduct] = useState(null);

    const addToCart = (p) => {
        setCart((c) => {
            const ex = c.find((x) => x.id === p.id);
            if (ex) return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
            return [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
        });
    };

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            {/* Баннер: -20% при покупке от 2000, 10:00–17:00 */}
            <CategoryBar active={active} setActive={setActive} />
            <Hero />

            {/* Табы категорий (один раз, без дубликатов) */}



            {/* Грид товаров по активной категории */}
            <ProductsGrid active={active} onAdd={addToCart} onOpen={setProduct} />

            {/* Почему нас выбирают */}
            <WhyUs />

            {/* Контакты */}
            <Contacts />

            {/* Если очень нужно оставить три карточки под WhyUs — вот версия без нестандартного класса */}
            {/*
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Доставка в течение 30 минут", "Быстро и вовремя"],
          ["Работают профессионалы", "Качество и вкус"],
          ["Принимаем заказы круглосуточно", "24/7"],
        ].map(([title, sub]) => (
          <div key={title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-base font-semibold">{title}</div>
            <div className="mt-1 text-sm text-neutral-600">{sub}</div>
          </div>
        ))}
      </div>
      */}
        </section>
    );
}
