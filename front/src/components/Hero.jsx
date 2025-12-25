import { useState, useEffect } from "react";
import hero from "./../../public/images/hero-20.png";
import card1 from "./../../public/images/card-1.png";
import card2 from "./../../public/images/card-2.png";
import card3 from "./../../public/images/card-3.png";

const SLIDES = [
    { id: 1, image: hero, title: "Добро пожаловать в Tokyo Express", description: "Лучшие роллы и суши в городе" },
    { id: 2, image: card1, title: "Специальные предложения", description: "Скидки до 30% на популярные позиции" },
    { id: 3, image: card2, title: "Быстрая доставка", description: "Доставим ваш заказ за 60 минут" },
    { id: 4, image: card3, title: "Свежие продукты", description: "Готовим только из свежих ингредиентов" },
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    return (
        <section
            className="mx-auto max-w-7xl px-4 mt-4 rounded-[--radius-xl2] overflow-hidden relative"
            style={{ aspectRatio: "1440/578" }}
        >
            {/* Слайды */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />

                    {/* Текст слайда */}
                    <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16">
                        <h2 className="text-white text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                            {slide.title}
                        </h2>
                        <p className="text-white text-lg md:text-2xl drop-shadow-lg">
                            {slide.description}
                        </p>
                    </div>
                </div>
            ))}

            {/* Кнопки навигации */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full w-10 h-10 flex items-center justify-center transition z-10"
                aria-label="Предыдущий слайд"
            >
                ‹
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full w-10 h-10 flex items-center justify-center transition z-10"
                aria-label="Следующий слайд"
            >
                ›
            </button>

            {/* Индикаторы */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition ${
                            index === currentSlide ? "bg-white w-8" : "bg-white/50"
                        }`}
                        aria-label={`Перейти к слайду ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
