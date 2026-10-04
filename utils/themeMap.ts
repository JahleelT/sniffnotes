// Visual theme for each mood. A fragrance's first tag decides its page theme.
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
        accent: "text-lime-300",
        border: "border-lime-200/20",
        card: "bg-slate-950/55",
        overlay: "bg-black/30",
    },

    fruity: {
        label: "Fruity",
        image: "/fruityBG.jpg",
        accent: "text-rose-300",
        border: "border-red-400/30",
        card: "bg-red-950/55",
        overlay: "bg-black/30",
    },

    dark: {
        label: "Dark",
        image: "/darkBG.jpg",
        accent: "text-zinc-300",
        border: "border-zinc-200/15",
        card: "bg-zinc-950/80",
        overlay: "bg-black/30",
    },

    smoky: {
        label: "Smoky",
        image: "/smokyBG.jpg",
        accent: "text-slate-300",
        border: "border-slate-300/20",
        card: "bg-slate-950/60",
        overlay: "bg-black/30",
    },

    woodsy: {
        label: "Woody",
        image: "/woodsyBG.jpg",
        accent: "text-amber-200",
        border: "border-emerald-300/20",
        card: "bg-emerald-950/60",
        overlay: "bg-black/30",
    },

    boozy: {
        label: "Boozy",
        image: "/boozyBG.jpg",
        accent: "text-amber-300",
        border: "border-amber-400/25",
        card: "bg-stone-950/70",
        overlay: "bg-black/30",
    },

    tropical: {
        label: "Tropical",
        image: "/tropicalBG.jpg",
        accent: "text-red-400",
        border: "border-lime-300/20",
        card: "bg-green-950/60",
        overlay: "bg-black/30",
    },

    floral: {
        label: "Floral",
        image: "/floralBG.jpg",
        accent: "text-orange-300",
        border: "border-emerald-300/20",
        card: "bg-emerald-950/55",
        overlay: "bg-black/30",
    },

    spicy: {
        label: "Spicy",
        image: "/spicyBG.jpg",
        accent: "text-orange-300",
        border: "border-orange-300/20",
        card: "bg-stone-950/70",
        overlay: "bg-black/30",
    },

    clean: {
        label: "Clean",
        image: "/cleanBG.jpg",
        accent: "text-stone-100",
        border: "border-white/30",
        card: "bg-stone-800/50",
        overlay: "bg-black/40",
    },

    solar: {
        label: "Solar",
        image: "/solarBG.jpg",
        accent: "text-amber-200",
        border: "border-amber-300/25",
        card: "bg-orange-950/50",
        overlay: "bg-black/30",
    },
} satisfies Record<string, Theme>;

export type Mood = keyof typeof themeMap;

export const moods = Object.keys(themeMap) as Mood[];

// Used for the homepage and anywhere no mood is selected.
export const defaultTheme: Theme = {
    label: "SniffNotes",
    image: "/dewy_grass.jpg",
    accent: "text-white",
    border: "border-white/10",
    card: "bg-slate-950/60",
    overlay: "bg-black/30",
};

export function isMood(value: string): value is Mood {
    return Object.hasOwn(themeMap, value);
}

export function getTheme(mood?: string): Theme {
    return mood && isMood(mood) ? themeMap[mood] : defaultTheme;
}
