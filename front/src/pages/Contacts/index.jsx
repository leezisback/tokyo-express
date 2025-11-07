import React from "react";
import { CONTACTS } from "@/lib/mock.js";

const TitleWithDot = ({ children }) => (
    <div className="relative inline-block mt-2 mb-10">
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

export default function Contacts() {
    return (
        <section id="contacts" className="mx-auto max-w-6xl px-4 py-10">
            <TitleWithDot>Контакты</TitleWithDot>
            <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
                <div>
                    <div className="opacity-90 text-[16px]">{CONTACTS.address}</div>
                    <div className="opacity-70 text-[16px]">{CONTACTS.hours}</div>
                </div>
                <div className="col-span-1 flex flex-col gap-1 md:col-span-2 text-[16px]">
                    {CONTACTS.phones.map(p => <div key={p}>{p}</div>)}
                </div>
            </div>
        </section>
    );
}
