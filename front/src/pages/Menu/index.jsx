// pages/Menu/index.jsx
import { useState, useMemo } from "react";
import CategoryBar from "@/components/CategoryBar";
import { PRODUCTS } from "@/lib/mock"; // [{id, title, price, image, category: 'rolls' | 'sushi' | ...}]

export default function MenuPage() {
    const [active, setActive] = useState("all");

    const list = useMemo(() => {
        return active === "all"
            ? PRODUCTS
            : PRODUCTS.filter((p) => p.category === active);
    }, [active]);

    return (
        <section className="max-w-6xl mx-auto px-4 py-6">
            <CategoryBar active={active} setActive={setActive} />

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.map((p) => (
                    <article key={p.id} className="rounded-2xl border shadow-sm overflow-hidden">
                        <img src={p.image} alt={p.title} className="w-full aspect-[4/3] object-contain bg-white" />
                        <div className="p-3">
                            <h3 className="font-semibold text-sm">{p.title}</h3>
                            <div className="mt-1 text-base font-bold">{p.price} ₽</div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
