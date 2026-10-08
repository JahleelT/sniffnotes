"use client";

import { useBackgroundPalette } from "@/components/BackgroundPalette";
import { defaultTheme } from "@/utils/themeMap";

// Matches its background and border to the photo behind it, shifting colors as the photo changes.
export default function HeroCard({ title, children }: { title: string; children: React.ReactNode }) {
    const { palette } = useBackgroundPalette();
    const { card, border, accent } = palette ?? { ...defaultTheme, accent: "" };
    // Same length as the slideshow's crossfade, so the card changes with the photo.
    const transition = "transition-[background-color,border-color,color] duration-[1800ms] ease-in-out";

    return (
        <section className={`w-full max-w-5xl flex flex-col items-center justify-center gap-6 p-6 sm:p-10 lg:px-14 rounded-2xl border backdrop-blur-md ${transition} ${card} ${border}`}>
            <h2 className={`text-2xl sm:text-3xl font-semibold text-center ${transition} ${accent}`}>{title}</h2>
            {children}
        </section>
    );
}
