// backend/src/seed.js
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Promotion = require("../models/Promotion");
const User = require("../models/User");


async function run() {
    try {
        console.log("[SEED] Подключаемся к MongoDB...");
        await connectDB();

        console.log("[SEED] Очищаем коллекции Category, Product, Promotion, User...");
        await Promise.all([
            Category.deleteMany({}),
            Product.deleteMany({}),
            Promotion.deleteMany({}),
            User.deleteMany({}),
        ]);

        console.log("[SEED] Создаём категории...");
        const categoriesData = [
            { slug: "classic", name: "Классические роллы", position: 1 },
            { slug: "baked",   name: "Запечённые роллы",   position: 2 },
            { slug: "sushi",   name: "Суши",               position: 3 },
            { slug: "sashimi", name: "Сашими",             position: 4 },
            { slug: "wok",     name: "WOK-лапша",          position: 5 },
            { slug: "soups",   name: "Супы",               position: 6 },
            { slug: "salads",  name: "Салаты",             position: 7 },
            { slug: "drinks",  name: "Напитки",            position: 8 },
        ];

        const categories = await Category.insertMany(categoriesData);
        const catBySlug = {};
        categories.forEach((c) => {
            catBySlug[c.slug] = c._id;
        });

        console.log("[SEED] Создаём товары...");
        const productsRaw = [
            {
                name: "Запечённая филадельфия",
                slug: "zapech-phila",
                categorySlug: "baked",
                price: 695,
                weight: "245 г",
                composition: "рис, нори, сливочный сыр, лосось, соус для запекания",
                image: "/uploads/card-1.png",
                popularity: 10,
                position: 1,
            },
            {
                name: "Запечённый Эби",
                slug: "zapech-ebi",
                categorySlug: "baked",
                price: 510,
                weight: "245 г",
                composition: "рис, нори, креветка, соус для запекания",
                image: "/uploads/card-2.png",
                popularity: 7,
                position: 2,
            },
            {
                name: "Запечённый Цезарь",
                slug: "zapech-cezar",
                categorySlug: "baked",
                price: 455,
                weight: "245 г",
                composition:
                    "рис, нори, помидор, лист салата, соус цезарь, соус сырный для запекания, куриное филе, сухари панировочные, пармезан",
                image: "/uploads/card-3.png",
                popularity: 6,
                position: 3,
            },
        ];

        const productsData = productsRaw
            .filter((p) => catBySlug[p.categorySlug])
            .map((p) => ({
                name: p.name,
                slug: p.slug,
                category: catBySlug[p.categorySlug],
                description: p.composition,
                composition: p.composition,
                weight: p.weight,
                price: p.price,
                image: p.image || "",
                isAvailable: true,
                isPromotion: false,
                discountPercent: 0,
                position: p.position || 0,
            }));

        await Product.insertMany(productsData);

        console.log("[SEED] Создаём акцию...");
        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await Promotion.create({
            title: "–20% при заказе от 2000 ₽",
            description:
                "Скидка 20% на всё меню при заказе от 2000 рублей. Каждый день с 10:00 до 17:00.",
            discountPercent: 20,
            minOrderTotal: 2000,
            activeFrom: now,
            activeTo: in30Days,
            isActive: true,
        });

        console.log("[SEED] Создаём администратора...");
        const passwordHash = await bcrypt.hash("admin123", 10);
        await User.create({
            login: "admin",
            passwordHash,
            role: "admin",
            name: "Администратор",
        });

        console.log("[SEED] Готово! База заполнена тестовыми данными.");
        process.exit(0);
    } catch (err) {
        console.error("[SEED] Ошибка:", err);
        process.exit(1);
    }
}

run();
