export const CATEGORY_TABS = [
    { key: "sushi", label: "Суши" },
    { key: "rolls", label: "Роллы" },
    { key: "sets", label: "Сеты" },
    { key: "baked", label: "Запечённые роллы" },
    { key: "promo", label: "Акции" },
];

export const CATEGORY_DROPDOWN = [
    "Классические роллы",
    "Запечённые роллы",
    "Суши",
    "Сашими",
    "WOK-лапша",
    "Супы",
    "Салаты",
    "Напитки",
    "Акции",
    "Все",
];

// src/lib/mock.js
import card1 from "@/assets/images/card-1.png";
import card2 from "@/assets/images/card-2.png";
import card3 from "@/assets/images/card-3.png";
import card4 from "@/assets/images/card-4.png";
import card5 from "@/assets/images/card-5.png";

export const PRODUCTS = [
    {
        id: "1",
        name: "Запечённая филадельфия",
        price: 695,
        weight: 245,
        description: "рис, нори, сливочный сыр, лосось, соус для запекания",
        category: "baked",
        image: card1,
    },
    {
        id: "2",
        name: "Запечённый Эби",
        price: 510,
        weight: 245,
        description: "рис, нори, креветка, соус для запекания",
        category: "baked",
        image: card2,
    },
    {
        id: "3",
        name: "Запечённый Цезарь",
        price: 455,
        weight: 245,
        description:
            "рис, нори, помидор, лист салата, соус цезарь, соус сырный для запекания, куриное филе, сухари панировочные, пармезан",
        category: "baked",
        image: card3,
    },
    {
        id: "4",
        name: "Запечённый с угрём",
        price: 665,
        weight: 245,
        description: "рис, нори, угорь, соус для запекания",
        category: "baked",
        image: card4,
    },
    {
        id: "5",
        name: "Запечённый с лососем",
        price: 580,
        weight: 245,
        description: "рис, нори, лосось, соус для запекания",
        category: "baked",
        image: card5,
    },
];


export const CONTACTS = {
    address: "г. Владивосток, ул. Пушкина, д. 108",
    phones: ["7 (996) 789 - 85 - 85", "7 (996) 789 - 85 - 75"],
    hours: "круглосуточно",
};
