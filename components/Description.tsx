import { fragrances } from "@/data/fragrances";

export default function Description() {
    const description = fragrances[0].description;

    return (
        <div className="border border-white/10 rounded-xl bg-slate-950/60 backdrop-blur-sm px-5">
            <h3 className="py-4 text-2xl font-semibold">Description</h3>

            <hr className="my-6 border-gray-500 mb-2 mt-2" />

            <p className="flex leading-relaxed text-white text-xl py-3 px-2">
            {description}
            </p>
        </div>
        
    )
}