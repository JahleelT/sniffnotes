import Image from "next/image";
import BottleImage from "@/components/BottleImage";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";

type FragrancePhotoProps = {
    fragrance: Fragrance;
    theme: Theme;
};

// The photo fills the width of its card at its own proportions; the card is as tall as the photo.
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
        <div className={`${card} w-full max-w-md mx-auto lg:max-w-none`}>
            <Image
                src={fragrance.image}
                alt={`${fragrance.brand} ${fragrance.name} bottle`}
                width={800}
                height={1200}
                priority
                sizes="(min-width: 1024px) 30vw, (min-width: 448px) 28rem, 100vw"
                className="block w-full h-auto"
            />
        </div>
    );
}
