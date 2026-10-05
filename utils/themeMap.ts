// Visual theme for each mood. A fragrance's first tag decides its page theme.
// `light:` classes apply in light mode; `theme-surface` lets high-contrast mode make cards solid.
// Keep this file free of `@/` imports — scripts/import-fragrances.mts reads it directly.

export type Theme = {
    label: string;
    image: string;
    accent: string;
    border: string;
    card: string;
    overlay: string;
};

export const themeMap = {

    tea: {
        label: "Tea",
        image: "/teaBG.jpg",
        accent: "text-lime-300 light:text-lime-800",
        border: "border-lime-200/20 light:border-lime-800/25",
        card: "theme-surface bg-slate-950/55 light:bg-lime-50/75",
        overlay: "bg-black/30 light:bg-white/35",
    },

    fruity: {
        label: "Fruity",
        image: "/fruityBG.jpg",
        accent: "text-rose-300 light:text-rose-700",
        border: "border-red-400/30 light:border-red-700/30",
        card: "theme-surface bg-red-950/55 light:bg-rose-50/75",
        overlay: "bg-black/30 light:bg-white/35",
    },

    dark: {
        label: "Dark",
        image: "/darkBG.jpg",
        accent: "text-zinc-300 light:text-zinc-700",
        border: "border-zinc-200/15 light:border-zinc-800/25",
        card: "theme-surface bg-zinc-950/80 light:bg-zinc-100/85",
        overlay: "bg-black/30 light:bg-white/45",
    },

    smoky: {
        label: "Smoky",
        image: "/smokyBG.jpg",
        accent: "text-slate-300 light:text-slate-700",
        border: "border-slate-300/20 light:border-slate-700/25",
        card: "theme-surface bg-slate-950/60 light:bg-slate-100/80",
        overlay: "bg-black/30 light:bg-white/40",
    },

    woodsy: {
        label: "Woody",
        image: "/woodsyBG.jpg",
        accent: "text-amber-200 light:text-amber-800",
        border: "border-emerald-300/20 light:border-emerald-800/25",
        card: "theme-surface bg-emerald-950/60 light:bg-emerald-50/80",
        overlay: "bg-black/30 light:bg-white/35",
    },

    boozy: {
        label: "Boozy",
        image: "/boozyBG.jpg",
        accent: "text-amber-300 light:text-amber-800",
        border: "border-amber-400/25 light:border-amber-800/30",
        card: "theme-surface bg-stone-950/70 light:bg-amber-50/80",
        overlay: "bg-black/30 light:bg-white/40",
    },

    tropical: {
        label: "Tropical",
        image: "/tropicalBG.jpg",
        accent: "text-red-400 light:text-red-700",
        border: "border-lime-300/20 light:border-green-800/25",
        card: "theme-surface bg-green-950/60 light:bg-green-50/80",
        overlay: "bg-black/30 light:bg-white/35",
    },

    floral: {
        label: "Floral",
        image: "/floralBG.jpg",
        accent: "text-orange-300 light:text-orange-700",
        border: "border-emerald-300/20 light:border-emerald-800/25",
        card: "theme-surface bg-emerald-950/55 light:bg-orange-50/75",
        overlay: "bg-black/30 light:bg-white/30",
    },

    spicy: {
        label: "Spicy",
        image: "/spicyBG.jpg",
        accent: "text-orange-300 light:text-orange-800",
        border: "border-orange-300/20 light:border-orange-800/25",
        card: "theme-surface bg-stone-950/70 light:bg-orange-50/80",
        overlay: "bg-black/30 light:bg-white/40",
    },

    clean: {
        label: "Clean",
        image: "/cleanBG.jpg",
        accent: "text-stone-100 light:text-stone-700",
        border: "border-white/30 light:border-stone-500/30",
        card: "theme-surface bg-stone-800/50 light:bg-white/70",
        overlay: "bg-black/40 light:bg-white/20",
    },

    solar: {
        label: "Solar",
        image: "/solarBG.jpg",
        accent: "text-amber-200 light:text-orange-800",
        border: "border-amber-300/25 light:border-amber-700/30",
        card: "theme-surface bg-orange-950/50 light:bg-amber-50/75",
        overlay: "bg-black/30 light:bg-white/30",
    },
} satisfies Record<string, Theme>;

export type Mood = keyof typeof themeMap;

export const moods = Object.keys(themeMap) as Mood[];

// Used for the homepage and anywhere no mood is selected.
export const defaultTheme: Theme = {
    label: "SniffNotes",
    image: "/dewy_grass.jpg",
    accent: "text-white light:text-stone-900",
    border: "border-white/10 light:border-stone-900/15",
    card: "theme-surface bg-slate-950/60 light:bg-white/70",
    overlay: "bg-black/30 light:bg-white/30",
};

export function isMood(value: string): value is Mood {
    return Object.hasOwn(themeMap, value);
}

export function getTheme(mood?: string): Theme {
    return mood && isMood(mood) ? themeMap[mood] : defaultTheme;
}
