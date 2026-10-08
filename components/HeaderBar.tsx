"use client";

import { useBackgroundPalette } from "@/components/BackgroundPalette";
import { defaultTheme } from "@/utils/themeMap";

// The home page's sticky header bar, tinted to match the photo behind it (like the search card).
export default function HeaderBar({ children }: { children: React.ReactNode }) {
    const { palette } = useBackgroundPalette();
    const { card, border } = palette ?? defaultTheme;

    return (
        <div className={`sticky top-0 z-40 backdrop-blur-sm border-b transition-[background-color,border-color] duration-[1800ms] ease-in-out ${card} ${border}`}>
            {children}
        </div>
    );
}
