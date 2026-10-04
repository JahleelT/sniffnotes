import Header from "@/components/Header";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";


type FragranceProps = {
    fragrance: Fragrance;
    theme: Theme;
};


export default function FragranceHeader({ fragrance, theme }: FragranceProps) {
    const { name, brand, collection } = fragrance;

    return (
        <div className=" w-full">
            <div className={`mb-8 backdrop-blur-sm border-b ${theme.card} ${theme.border}`}>
                <Header/>
            </div>

            <div className="mb-2">
                <h1 className="text-5xl font-semibold text-center text-white">{name}</h1>
                <h2 className=" mt-1 text-xl font-medium text-center text-white">
                    {collection
                        ? `${brand} • ${collection}`
                        : brand}
                </h2>
            </div>

        </div>
    );
}
