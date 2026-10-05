import BottleImage from "@/components/BottleImage";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";

type FragrancePhotoProps = {
    fragrance: Fragrance;
    theme: Theme;
};

export default function FragrancePhoto({ fragrance, theme }: FragrancePhotoProps) {

    return (
        <div className={`flex justify-center p-4 items-center backdrop-blur-sm border rounded-xl ${theme.card} ${theme.border}`}>
            <BottleImage
                fragrance={fragrance}
                width={400}
                height={600}
            />
        </div>

    );
}
