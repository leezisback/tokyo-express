import { Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header.jsx";
import HomePage from "@/pages/Home";
import MenuPage from "@/pages/Menu";
import PromotionsPage from "@/pages/Promotions";
import CheckoutPage from "@/pages/Checkout";
import ContactsPage from "@/pages/Contacts";
import AdminPage from "@/pages/Admin";
import Footer from "@/components/layout/Footer.jsx";

export default function App() {

    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="flex-1">


                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/promotions" element={<PromotionsPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>
            <Footer/>
        </div>
    );
}
