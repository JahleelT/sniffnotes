"use client";

import { createContext, useContext, useState } from "react";
import type { Palette } from "@/utils/themeMap";

type BackgroundPaletteValue = {
    palette: Palette | null;
    setPalette: (palette: Palette | null) => void;
};

const BackgroundPaletteContext = createContext<BackgroundPaletteValue>({ palette: null, setPalette: () => {} });

// Shares the palette of the photo currently behind the page, so panels can match it as it changes.
export function BackgroundPaletteProvider({ initial = null, children }: { initial?: Palette | null; children: React.ReactNode }) {
    const [palette, setPalette] = useState<Palette | null>(initial);
    return <BackgroundPaletteContext value={{ palette, setPalette }}>{children}</BackgroundPaletteContext>;
}

export function useBackgroundPalette() {
    return useContext(BackgroundPaletteContext);
}
