import Image from "next/image";
import BottleImage from "@/components/BottleImage";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";

type FragrancePhotoProps = {
    fragrance: Fragrance;
    theme: Theme;
};

// The photo fills its card edge to edge. On large screens the card stretches to the height of the
// notes and description beside it; stacked on smaller screens it keeps a portrait shape.
export default function FragrancePhoto({ fragrance, theme }: FragrancePhotoProps) {
    const card = `order-first lg:order-none relative overflow-hidden border rounded-xl backdrop-blur-sm ${theme.card} ${theme.border}`;

    if (!fragrance.image) {
        return (
            <div className={`${card} flex items-center justify-center p-4`}>
                <BottleImage fragrance={fragrance} width={400} height={600} className="max-h-[60vh] w-auto"/>
            </div>
        );
    }

    return (
        <div className={`${card} aspect-[4/5] max-h-[70vh] w-full max-w-md mx-auto lg:max-w-none lg:max-h-none lg:aspect-auto lg:min-h-[28rem]`}>
            <Image
                src={fragrance.image}
                alt={`${fragrance.brand} ${fragrance.name} bottle`}
                fill
                priority
                sizes="(min-width: 1024px) 30vw, (min-width: 448px) 28rem, 100vw"
                className="object-cover"
            />
        </div>
    );
}
