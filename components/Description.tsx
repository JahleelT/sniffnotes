import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";


type descriptionProps = {
    fragrance: Fragrance;
    theme: Theme;
};

export default function Description({ fragrance, theme }: descriptionProps) {
    const description = fragrance.description;

    return (
        <div className={`border rounded-xl backdrop-blur-sm px-5 ${theme.card} ${theme.border}`}>
            <h3 className={`py-4 text-2xl font-semibold ${theme.accent}`}>Description</h3>

            <hr className="my-6 border-gray-500 mb-2 mt-2" />

            <p className="flex leading-relaxed text-white text-xl py-3 px-2">
            {description}
            </p>
        </div>

    )
}
