import Image from "next/image";
import Link from "next/link";
import type { Fragrance } from "@/data/fragrances";
import { getTheme, themeMap } from "@/utils/themeMap";

type FragranceCardProps = {
    fragrance: Fragrance;
};

export default function FragranceCard({ fragrance }: FragranceCardProps) {
    const theme = getTheme(fragrance.tags[0]);

    return (
        <Link
            href={`/fragrance/${fragrance.id}`}
            className={`flex flex-col items-center gap-3 p-5 border rounded-xl backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 ${theme.card} ${theme.border}`}
        >
            <Image
                src={fragrance.image}
                alt={`${fragrance.brand} ${fragrance.name} bottle`}
                width={200}
                height={300}
                className="h-56 w-auto object-contain"
            />

            <div className="text-center">
                <h3 className="text-2xl font-semibold text-white">{fragrance.name}</h3>
                <p className="text-lg text-white/80">{fragrance.brand}</p>
            </div>

            <p className={`text-sm ${theme.accent}`}>
                {fragrance.tags.map((tag) => themeMap[tag].label).join(" • ")}
            </p>
        </Link>
    );
}
