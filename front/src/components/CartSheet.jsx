import React from "react";

export default function CartSheet({ open, onClose, cart, setCart, onCheckout }) {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = 150;

    return (
        <div className={`fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-start justify-center bg-black/40 p-4`} onClick={onClose}>
            <div onClick={(e)=>e.stopPropagation()} className="modal w-full max-w-5xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 py-1">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#cf4e4e] text-sm text-white">●</span>
                        <span className="text-xl font-semibold">Корзина</span>
                    </div>
                    <button className="rounded-full p-1 hover:bg-neutral-100" onClick={onClose}>✕</button>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_360px]">
                    <div className="flex flex-col gap-3">
                        {cart.map((i) => (
                            <div key={i.id} className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-14 w-14 rounded-lg bg-neutral-300" />
                                    <div>
                                        <div className="text-sm font-medium">{i.name}</div>
                                        <div className="mt-1 flex items-center gap-2 text-sm">
                                            <button className="grid h-6 w-6 place-items-center rounded-full border" onClick={() => setCart(c=>c.map(x=>x.id===i.id?{...x, qty:Math.max(1,x.qty-1)}:x))}>–</button>
                                            <span>{i.qty}</span>
                                            <button className="grid h-6 w-6 place-items-center rounded-full border" onClick={() => setCart(c=>c.map(x=>x.id===i.id?{...x, qty:x.qty+1}:x))}>+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 text-right text-sm">{i.price}₽</div>
                                    <button className="text-xl" onClick={() => setCart(c=>c.filter(x=>x.id!==i.id))}>×</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl bg-brand-card p-5">
                        <div className="mb-2 flex justify-between text-sm"><span>Товары</span><span>{total}₽</span></div>
                        <div className="mb-2 flex justify-between text-sm"><span>Скидка</span><span>0₽</span></div>
                        <div className="mb-4 flex justify-between text-sm"><span>Доставка</span><span>{delivery}₽</span></div>
                        <div className="mb-4 flex justify-between text-lg font-semibold"><span>Итого</span><span>{total + delivery}₽</span></div>
                        <button className="w-full rounded-xl bg-brand-rose px-6 py-3 font-semibold text-white shadow" onClick={onCheckout}>
                            Оформить заказ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
