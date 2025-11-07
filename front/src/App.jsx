import { Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header.jsx";
import HomePage from "@/pages/Home";
import MenuPage from "@/pages/Menu";
import PromotionsPage from "@/pages/Promotions";
import CheckoutPage from "@/pages/Checkout";
import ContactsPage from "@/pages/Contacts";
import AdminPage from "@/pages/Admin";
import CartSheet from "@/components/CartSheet.jsx";
import ProductModal from "@/components/ProductModal.jsx";
import CheckoutModal from "@/components/CheckoutModal.jsx";
import {useState} from "react";
import Footer from "@/components/layout/Footer.jsx";

export default function App() {
    const [active, setActive] = useState("baked");
    const [cart, setCart] = useState([]);
    const [product, setProduct] = useState(null);
    const [openCart, setOpenCart] = useState(false);
    const [openCheckout, setOpenCheckout] = useState(false);
    const addToCart = (p) => {
        setCart((c) => {
            const ex = c.find((x) => x.id === p.id);
            if (ex) return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
            return [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
        });
    };
    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="flex-1">

                <ProductModal product={product} open={!!product} onClose={()=>setProduct(null)} onAdd={addToCart} />
                <CartSheet open={openCart} onClose={()=>setOpenCart(false)} cart={cart} setCart={setCart} onCheckout={()=>{ setOpenCart(false); setOpenCheckout(true); }} />
                <CheckoutModal open={openCheckout} onClose={()=>setOpenCheckout(false)} />
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
