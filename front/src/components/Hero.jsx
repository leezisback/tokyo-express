import hero from "@/assets/images/hero-20.png";

export default function Hero() {
    return (
        <section
            className="mx-auto max-w-7xl px-4 mt-4 rounded-[--radius-xl2] overflow-hidden relative"
            style={{ aspectRatio: "1440/578" }}
        >
            <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/25" />
        </section>
    );
}
