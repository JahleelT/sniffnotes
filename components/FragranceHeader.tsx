import Header from "@/components/Header";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";


type FragranceProps = {
    fragrance: Fragrance;
    theme: Theme;
    actions?: React.ReactNode;
};


export default function FragranceHeader({ fragrance, theme, actions }: FragranceProps) {
    const { name, brand, collection } = fragrance;

    return (
        <div className=" w-full">
            <div className={`mb-6 sm:mb-8 backdrop-blur-sm border-b ${theme.card} ${theme.border}`}>
                <Header/>
            </div>

            <div className="mb-2 px-4">
                <h1 className="text-4xl sm:text-5xl font-semibold text-center text-foreground">{name}</h1>
                <h2 className=" mt-1 text-lg sm:text-xl font-medium text-center text-foreground">
                    {collection
                        ? `${brand} • ${collection}`
                        : brand}
                </h2>
                {actions && <div className="mt-4 flex justify-center">{actions}</div>}
            </div>

        </div>
    );
}
