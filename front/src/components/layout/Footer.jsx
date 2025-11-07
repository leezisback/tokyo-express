// src/components/layout/Footer.jsx
import React from "react";
import logo from "./../../assets/images/logo.png"; // проверь путь к файлу

export default function Footer() {
    return (
        <footer className="mt-10 bg-[#6B6B6B]">
            <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between gap-6">
                <p className="max-w-[760px] text-[14px] leading-[1.45] text-white/85">
                    «Токио Экспресс» — это не просто ресторан, а настоящее путешествие в сердце Японии, где
                    традиции встречаются с динамичным ритмом современного города. Мы предлагаем гостям
                    насладиться подлинным вкусом суши и роллов в атмосфере лёгкости и комфорта.
                </p>

                <img
                    src={logo}
                    alt="Токио Экспресс"
                    className="h-[100px] w-auto shrink-0 opacity-95"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        </footer>
    );
}
