/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                // оттенки по скринам
                brand: {
                    rose: "#d97a7a",        // верхняя полоса
                    roseDark: "#d34747",    // круг логотипа
                    card: "#d97a7a33",      // розовый фон карточек (20% прозрачн.)
                    border: "#de9696",      // рамка карточек
                }
            },
            boxShadow: {
                card: "0 4px 14px rgba(0,0,0,0.12)",
                inner: "inset 0 6px 18px rgba(0,0,0,0.10)",
                modal: "0 24px 60px rgba(0,0,0,0.35)"
            },
            borderRadius: {
                xl2: "14px", // чуть меньше стандартного 16px, ближе к макету
            },
            fontFamily: {
                ui: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"]
            }
        },
    },
    plugins: [],
}
