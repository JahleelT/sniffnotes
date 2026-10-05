import Image from "next/image";
import { FlaskConical } from "lucide-react";
import type { Fragrance } from "@/data/fragrances";

type BottleImageProps = {
    fragrance: Fragrance;
    width: number;
    height: number;
    className?: string;
};

// Shows a placeholder until the fragrance has a photo in public/fragrances/.
export default function BottleImage({ fragrance, width, height, className = "" }: BottleImageProps) {
    if (!fragrance.image) {
        return (
            <div
                className={`flex flex-col items-center justify-center gap-3 max-w-full text-foreground/60 ${className}`}
                style={{ width, aspectRatio: `${width} / ${height}` }}
            >
                <FlaskConical size={width / 4} strokeWidth={1.25}/>
                <span className="text-sm">Photo coming soon</span>
            </div>
        );
    }

    return (
        <Image
            src={fragrance.image}
            alt={`${fragrance.brand} ${fragrance.name} bottle`}
            width={width}
            height={height}
            className={`object-contain rounded-xl shadow-lg ${className}`}
        />
    );
}
