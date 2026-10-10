"use client";

import Link from "next/link";
import { useBackgroundPalette } from "@/components/BackgroundPalette";

// The "SniffNotes" title. On the home page slideshow it takes the photo's accent color, like the
// search card's heading; everywhere else there's no background palette, so it keeps the normal color.
export default function HeaderTitle() {
    const { palette } = useBackgroundPalette();

    return (
        <Link
            href="/"
            className={`text-2xl sm:text-4xl short:text-2xl font-semibold transition-colors duration-[1800ms] ease-in-out ${palette?.accent ?? ""}`}
        >
            SniffNotes
        </Link>
    );
}
