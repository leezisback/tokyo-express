// src/components/WhyUs.jsx
import React from "react";
import benefit1 from "./../assets/images/delivery.png";
import benefit2 from "./../assets/images/advantage-pros.png";
import benefit3 from "./../assets/images/adv-24-7.png";

const TitleWithDot = ({ children }) => (
    <div className="relative inline-block mt-2 mb-16">
        {/* круг по скрину: ~26px, сдвинут под первую букву */}
        <span
            aria-hidden
            className="absolute -left-[18px] top-1/2 -translate-y-1/2 h-[60px] w-[60px] rounded-full bg-[#E42226]"
        />
        <h2 className="relative z-10 font-bold text-[24px] leading-[100%]">
            {children}
        </h2>
    </div>
);
const Card = ({ img, title }) => (
    <div className="relative overflow-hidden mr-16 rounded-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        {/* картинка строго по пропорции макета 354x300 */}
        <div className="aspect-[300/400]">
            <img
                src={img}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
            />
        </div>

        {/* нижний градиент и подпись */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="h-24 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-2 flex justify-center">
                <div className="rounded-[14px] bg-black/70 px-4 py-2 text-center text-white text-[10px] font-semibold leading-tight max-w-[100%]">
                    {title}
                </div>
            </div>
        </div>
    </div>
);
export default function WhyUs() {
    const cards = [
        { t: "Доставка в течение 30 минут", img: benefit1 },
        { t: "Работают профессионалы",      img: benefit2 },
        { t: "Принимаем заказы круглосуточно", img: benefit3 },
    ];

    return (
        <section id="benefits" className="mx-auto max-w-6xl px-4 py-10">
            <TitleWithDot>Почему нас выбирают</TitleWithDot>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                {cards.map((c) => (
                    <Card key={c.title} img={c.img} title={c.title}/>
                ))}
            </div>
        </section>
    );
}
