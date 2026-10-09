"use client";

import { useState } from "react";
import { LayoutGrid, Square } from "lucide-react";
import { useBackgroundPalette } from "@/components/BackgroundPalette";
import MoodMosaic from "@/components/MoodMosaic";
import MoodSlideshow, { type Slide } from "@/components/MoodSlideshow";
import { HOME_BACKGROUND_COOKIE, type HomeBackgroundMode } from "@/lib/home-background";

type HomeBackgroundProps = {
    initialMode: HomeBackgroundMode;
    slides: Slide[];
    // The grid's first 12 photos (chosen on the server) and every photo it can cycle through.
    gridInitial: string[];
    gridPhotos: string[];
};

// The home page background: one large photo or a grid of them, with a small toggle between the two.
// The choice is remembered in a cookie so the server renders the same mode next time.
export default function HomeBackground({ initialMode, slides, gridInitial, gridPhotos }: HomeBackgroundProps) {
    const [mode, setMode] = useState(initialMode);
    const { setPalette } = useBackgroundPalette();

    const toggle = () => {
        const next = mode === "single" ? "grid" : "single";
        setMode(next);
        // The header and search card match the single photo; the grid has no one photo, so they go neutral.
        setPalette(next === "single" ? slides[0]?.palette ?? null : null);
        document.cookie = `${HOME_BACKGROUND_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    };

    const label = mode === "single" ? "Show a grid of photos" : "Show one large photo";

    return (
        <>
            {mode === "single" ? <MoodSlideshow slides={slides}/> : <MoodMosaic photos={gridPhotos} initial={gridInitial}/>}

            <button
                type="button"
                onClick={toggle}
                aria-label={label}
                title={label}
                className="fixed bottom-4 right-4 z-40 inline-flex items-center justify-center size-10 rounded-full border border-foreground/40 bg-background/60 backdrop-blur-md hover:bg-background/80 transition-all duration-200 cursor-pointer"
            >
                {mode === "single" ? <LayoutGrid aria-hidden className="size-4"/> : <Square aria-hidden className="size-4"/>}
            </button>
        </>
    );
}
