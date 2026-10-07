import Link from "next/link";
import Header from "@/components/Header";
import { brandSlug } from "@/lib/brands";
import { searchHref } from "@/lib/search-params";
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
            <div className={`sticky top-0 z-40 mb-6 sm:mb-8 backdrop-blur-sm border-b ${theme.card} ${theme.border}`}>
                <Header/>
            </div>

            <div className="mb-2 px-4">
                <h1 className="text-4xl sm:text-5xl font-semibold text-center text-foreground">{name}</h1>
                <h2 className=" mt-1 text-lg sm:text-xl font-medium text-center text-foreground">
                    <Link href={`/brands/${brandSlug(brand)}`} className="hover:underline underline-offset-4">{brand}</Link>
                    {collection && (
                        <>
                            {" • "}
                            <Link href={searchHref({ brand, line: collection })} className="hover:underline underline-offset-4">{collection}</Link>
                        </>
                    )}
                </h2>
                {actions && <div className="mt-4 flex justify-center">{actions}</div>}
            </div>

        </div>
    );
}
