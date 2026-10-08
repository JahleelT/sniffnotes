// Visual themes for each mood. Every background photo gets its own palette; a fragrance page
// picks one of its first mood's photos at random.
// `light:` classes apply in light mode; `theme-surface` lets high-contrast mode make cards solid.
// Keep this file free of `@/` imports — the scripts in scripts/ read it directly.

export type Theme = {
    label: string;
    image: string;
    accent: string;
    border: string;
    card: string;
    overlay: string;
};

type PhotoTheme = Omit<Theme, "label">;

type MoodDefinition = {
    label: string;
    // Other tag spellings that map to this mood in the import CSV (e.g. "Vanilla" → Gourmand).
    aliases: string[];
    themes: PhotoTheme[];
};

const bg = (path: string) => `/backgrounds/${path}.jpg`;

export const themeMap = {

    tea: {
        label: "Tea",
        aliases: ["matcha"],
        themes: [
            {
                image: bg("tea/tea-field"),
                accent: "text-lime-300 light:text-lime-800",
                border: "border-lime-200/20 light:border-lime-800/25",
                card: "theme-surface bg-slate-950/55 light:bg-lime-50/75",
                overlay: "bg-black/30 light:bg-white/35",
            },
        ],
    },

    fruity: {
        label: "Fruity",
        aliases: ["fruit", "berry"],
        themes: [
            {
                image: bg("fruity/red-berries"),
                accent: "text-rose-300 light:text-rose-700",
                border: "border-red-400/30 light:border-red-700/30",
                card: "theme-surface bg-red-950/55 light:bg-rose-50/75",
                overlay: "bg-black/30 light:bg-white/35",
            },
            {
                image: bg("fruity/berries"),
                accent: "text-pink-300 light:text-pink-700",
                border: "border-sky-300/25 light:border-blue-800/25",
                card: "theme-surface bg-indigo-950/60 light:bg-pink-50/75",
                overlay: "bg-black/35 light:bg-white/30",
            },
            {
                image: bg("fruity/citrus"),
                accent: "text-orange-200 light:text-orange-700",
                border: "border-orange-300/30 light:border-orange-700/30",
                card: "theme-surface bg-orange-950/60 light:bg-orange-50/80",
                overlay: "bg-black/40 light:bg-white/35",
            },
        ],
    },

    dark: {
        label: "Dark",
        aliases: ["leathery", "leather", "night"],
        themes: [
            {
                image: bg("dark/hallway"),
                accent: "text-zinc-300 light:text-zinc-700",
                border: "border-zinc-200/15 light:border-zinc-800/25",
                card: "theme-surface bg-zinc-950/80 light:bg-zinc-100/85",
                overlay: "bg-black/30 light:bg-white/45",
            },
            {
                image: bg("dark/city-lights"),
                accent: "text-sky-300 light:text-sky-800",
                border: "border-sky-300/20 light:border-slate-800/25",
                card: "theme-surface bg-slate-950/70 light:bg-slate-100/85",
                overlay: "bg-black/25 light:bg-white/45",
            },
            {
                image: bg("dark/moonlit"),
                accent: "text-indigo-200 light:text-indigo-800",
                border: "border-indigo-300/25 light:border-indigo-800/25",
                card: "theme-surface bg-indigo-950/60 light:bg-indigo-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("dark/astigmatism"),
                accent: "text-amber-200 light:text-amber-800",
                border: "border-amber-200/20 light:border-amber-800/25",
                card: "theme-surface bg-neutral-950/75 light:bg-amber-50/85",
                overlay: "bg-black/30 light:bg-white/45",
            },
        ],
    },

    smoky: {
        label: "Smoky",
        aliases: ["smoke"],
        themes: [
            {
                image: bg("smoky/smoke"),
                accent: "text-slate-300 light:text-slate-700",
                border: "border-slate-300/20 light:border-slate-700/25",
                card: "theme-surface bg-slate-950/60 light:bg-slate-100/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("smoky/incense"),
                accent: "text-orange-200 light:text-orange-800",
                border: "border-orange-200/20 light:border-orange-900/25",
                card: "theme-surface bg-stone-950/70 light:bg-orange-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("smoky/fire"),
                accent: "text-amber-300 light:text-red-800",
                border: "border-orange-400/30 light:border-red-800/25",
                card: "theme-surface bg-neutral-950/70 light:bg-amber-50/80",
                overlay: "bg-black/45 light:bg-white/40",
            },
            {
                image: bg("smoky/misty"),
                accent: "text-rose-200 light:text-rose-800",
                border: "border-rose-200/25 light:border-stone-700/25",
                card: "theme-surface bg-stone-900/60 light:bg-rose-50/70",
                overlay: "bg-black/40 light:bg-white/20",
            },
        ],
    },

    woodsy: {
        label: "Woody",
        aliases: ["wood", "woods"],
        themes: [
            {
                image: bg("woodsy/pine-forest"),
                accent: "text-amber-200 light:text-amber-800",
                border: "border-emerald-300/20 light:border-emerald-800/25",
                card: "theme-surface bg-emerald-950/60 light:bg-emerald-50/80",
                overlay: "bg-black/30 light:bg-white/35",
            },
            {
                image: bg("woodsy/earthy"),
                accent: "text-rose-300 light:text-rose-800",
                border: "border-stone-300/20 light:border-stone-800/25",
                card: "theme-surface bg-stone-950/70 light:bg-stone-100/80",
                overlay: "bg-black/25 light:bg-white/40",
            },
            {
                image: bg("woodsy/lone-bench"),
                accent: "text-amber-200 light:text-amber-900",
                border: "border-stone-200/25 light:border-stone-700/30",
                card: "theme-surface bg-stone-900/65 light:bg-white/70",
                overlay: "bg-black/40 light:bg-white/20",
            },
        ],
    },

    boozy: {
        label: "Boozy",
        aliases: ["liquor", "whiskey", "rum"],
        themes: [
            {
                image: bg("boozy/whiskey-bar"),
                accent: "text-amber-300 light:text-amber-800",
                border: "border-amber-400/25 light:border-amber-800/30",
                card: "theme-surface bg-stone-950/70 light:bg-amber-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("boozy/amber"),
                accent: "text-amber-300 light:text-amber-800",
                border: "border-amber-500/25 light:border-amber-800/30",
                card: "theme-surface bg-neutral-950/75 light:bg-amber-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
        ],
    },

    tropical: {
        label: "Tropical",
        aliases: ["coconut"],
        themes: [
            {
                image: bg("tropical/heliconia"),
                accent: "text-red-400 light:text-red-700",
                border: "border-lime-300/20 light:border-green-800/25",
                card: "theme-surface bg-green-950/60 light:bg-green-50/80",
                overlay: "bg-black/30 light:bg-white/35",
            },
            {
                image: bg("tropical/monstera"),
                accent: "text-emerald-200 light:text-emerald-800",
                border: "border-emerald-300/25 light:border-emerald-800/25",
                card: "theme-surface bg-emerald-950/65 light:bg-emerald-50/80",
                overlay: "bg-black/35 light:bg-white/35",
            },
        ],
    },

    floral: {
        label: "Floral",
        aliases: ["flowers", "flower"],
        themes: [
            {
                image: bg("floral/tulips"),
                accent: "text-orange-300 light:text-orange-700",
                border: "border-emerald-300/20 light:border-emerald-800/25",
                card: "theme-surface bg-emerald-950/55 light:bg-orange-50/75",
                overlay: "bg-black/30 light:bg-white/30",
            },
            {
                image: bg("floral/bright-flowers"),
                accent: "text-yellow-200 light:text-rose-700",
                border: "border-lime-200/25 light:border-green-800/25",
                card: "theme-surface bg-green-950/60 light:bg-white/75",
                overlay: "bg-black/40 light:bg-white/30",
            },
            {
                image: bg("floral/lavender"),
                accent: "text-violet-200 light:text-violet-800",
                border: "border-violet-300/25 light:border-violet-800/25",
                card: "theme-surface bg-violet-950/60 light:bg-violet-50/80",
                overlay: "bg-black/40 light:bg-white/35",
            },
        ],
    },

    spicy: {
        label: "Spicy",
        aliases: ["spice", "spices"],
        themes: [
            {
                image: bg("spicy/spice-bowl"),
                accent: "text-orange-300 light:text-orange-800",
                border: "border-orange-300/20 light:border-orange-800/25",
                card: "theme-surface bg-stone-950/70 light:bg-orange-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("spicy/cinnamon"),
                accent: "text-orange-300 light:text-orange-900",
                border: "border-amber-700/30 light:border-amber-900/25",
                card: "theme-surface bg-stone-950/70 light:bg-orange-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
        ],
    },

    clean: {
        label: "Clean",
        aliases: ["soapy", "powdery", "musky"],
        themes: [
            {
                image: bg("clean/linen"),
                accent: "text-stone-100 light:text-stone-700",
                border: "border-white/30 light:border-stone-500/30",
                card: "theme-surface bg-stone-800/50 light:bg-white/70",
                overlay: "bg-black/40 light:bg-white/20",
            },
        ],
    },

    solar: {
        label: "Solar",
        aliases: ["citrus", "bright", "sunny"],
        themes: [
            {
                image: bg("solar/sunset"),
                accent: "text-amber-200 light:text-orange-800",
                border: "border-amber-300/25 light:border-amber-700/30",
                card: "theme-surface bg-orange-950/50 light:bg-amber-50/75",
                overlay: "bg-black/30 light:bg-white/30",
            },
            {
                image: bg("solar/desert"),
                accent: "text-amber-200 light:text-amber-800",
                border: "border-orange-200/25 light:border-orange-800/25",
                card: "theme-surface bg-stone-950/55 light:bg-orange-50/75",
                overlay: "bg-black/35 light:bg-white/30",
            },
        ],
    },

    green: {
        label: "Green",
        aliases: ["herbal", "leafy", "grassy", "aromatic"],
        themes: [
            {
                image: bg("green/dewy"),
                accent: "text-emerald-200 light:text-emerald-800",
                border: "border-emerald-200/20 light:border-emerald-800/25",
                card: "theme-surface bg-slate-950/60 light:bg-emerald-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("green/mossy"),
                accent: "text-lime-200 light:text-lime-900",
                border: "border-lime-300/25 light:border-lime-800/30",
                card: "theme-surface bg-stone-950/65 light:bg-lime-50/80",
                overlay: "bg-black/40 light:bg-white/35",
            },
            {
                image: bg("green/dewy-grass"),
                accent: "text-lime-200 light:text-green-800",
                border: "border-lime-200/20 light:border-green-800/20",
                card: "theme-surface bg-slate-950/60 light:bg-white/70",
                overlay: "bg-black/30 light:bg-white/30",
            },
        ],
    },

    aquatic: {
        label: "Aquatic",
        aliases: ["fresh", "marine", "oceanic", "ocean", "blue", "watery"],
        themes: [
            {
                image: bg("aquatic/ocean"),
                accent: "text-cyan-200 light:text-cyan-800",
                border: "border-cyan-300/25 light:border-cyan-800/25",
                card: "theme-surface bg-slate-950/65 light:bg-cyan-50/80",
                overlay: "bg-black/25 light:bg-white/40",
            },
            {
                image: bg("aquatic/crashing-waves"),
                accent: "text-sky-200 light:text-sky-800",
                border: "border-sky-200/25 light:border-sky-800/25",
                card: "theme-surface bg-slate-950/60 light:bg-sky-50/80",
                overlay: "bg-black/40 light:bg-white/35",
            },
            {
                image: bg("aquatic/dark-ocean"),
                accent: "text-teal-200 light:text-teal-800",
                border: "border-teal-300/20 light:border-teal-800/25",
                card: "theme-surface bg-slate-950/70 light:bg-teal-50/85",
                overlay: "bg-black/25 light:bg-white/45",
            },
            {
                image: bg("aquatic/rocky-coastline"),
                accent: "text-cyan-200 light:text-cyan-800",
                border: "border-cyan-300/25 light:border-cyan-800/25",
                card: "theme-surface bg-stone-950/65 light:bg-cyan-50/80",
                overlay: "bg-black/35 light:bg-white/35",
            },
            {
                image: bg("aquatic/seaweed"),
                accent: "text-emerald-200 light:text-emerald-800",
                border: "border-emerald-300/20 light:border-emerald-800/25",
                card: "theme-surface bg-emerald-950/65 light:bg-emerald-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("aquatic/watery-dunes"),
                accent: "text-rose-200 light:text-rose-800",
                border: "border-rose-200/25 light:border-teal-800/25",
                card: "theme-surface bg-teal-950/60 light:bg-rose-50/75",
                overlay: "bg-black/35 light:bg-white/30",
            },
            {
                image: bg("aquatic/wavy-colorful-dunes"),
                accent: "text-orange-200 light:text-teal-800",
                border: "border-teal-200/25 light:border-teal-800/25",
                card: "theme-surface bg-teal-950/60 light:bg-orange-50/75",
                overlay: "bg-black/35 light:bg-white/30",
            },
        ],
    },

    gourmand: {
        label: "Gourmand",
        aliases: ["vanilla", "sweet", "honey", "coffee", "chocolate", "caramel", "cozy"],
        themes: [
            {
                image: bg("gourmand/vanilla"),
                accent: "text-stone-200 light:text-stone-800",
                border: "border-white/30 light:border-stone-500/30",
                card: "theme-surface bg-stone-900/60 light:bg-white/75",
                overlay: "bg-black/45 light:bg-white/20",
            },
            {
                image: bg("gourmand/coffee"),
                accent: "text-amber-200 light:text-amber-900",
                border: "border-amber-300/20 light:border-amber-900/25",
                card: "theme-surface bg-stone-950/70 light:bg-amber-50/80",
                overlay: "bg-black/30 light:bg-white/40",
            },
            {
                image: bg("gourmand/coffee-beans"),
                accent: "text-orange-200 light:text-amber-900",
                border: "border-stone-400/20 light:border-stone-800/25",
                card: "theme-surface bg-stone-950/75 light:bg-stone-100/85",
                overlay: "bg-black/25 light:bg-white/45",
            },
            {
                image: bg("gourmand/cozy"),
                accent: "text-amber-100 light:text-amber-900",
                border: "border-stone-200/30 light:border-stone-600/30",
                card: "theme-surface bg-stone-800/60 light:bg-stone-50/75",
                overlay: "bg-black/40 light:bg-white/20",
            },
            {
                image: bg("gourmand/candle-book"),
                accent: "text-orange-200 light:text-orange-900",
                border: "border-orange-200/25 light:border-orange-800/25",
                card: "theme-surface bg-stone-950/60 light:bg-orange-50/75",
                overlay: "bg-black/35 light:bg-white/30",
            },
        ],
    },

    resinous: {
        label: "Resinous",
        aliases: ["resin", "amber", "balsamic"],
        themes: [
            {
                image: bg("resinous/resin"),
                accent: "text-amber-300 light:text-amber-800",
                border: "border-amber-400/25 light:border-amber-800/30",
                card: "theme-surface bg-neutral-950/75 light:bg-amber-50/85",
                overlay: "bg-black/25 light:bg-white/45",
            },
        ],
    },

    ancient: {
        label: "Ancient",
        aliases: ["timeless", "historic"],
        themes: [
            {
                image: bg("ancient/nile"),
                accent: "text-amber-200 light:text-sky-800",
                border: "border-sky-200/25 light:border-sky-800/25",
                card: "theme-surface bg-slate-950/60 light:bg-sky-50/75",
                overlay: "bg-black/40 light:bg-white/30",
            },
            {
                image: bg("ancient/museum"),
                accent: "text-amber-200 light:text-amber-900",
                border: "border-amber-200/25 light:border-amber-800/25",
                card: "theme-surface bg-stone-950/65 light:bg-amber-50/80",
                overlay: "bg-black/35 light:bg-white/35",
            },
            {
                image: bg("ancient/empty-museum"),
                accent: "text-stone-200 light:text-stone-800",
                border: "border-stone-200/25 light:border-stone-700/25",
                card: "theme-surface bg-stone-900/65 light:bg-stone-50/80",
                overlay: "bg-black/35 light:bg-white/30",
            },
            {
                image: bg("ancient/library"),
                accent: "text-amber-300 light:text-amber-900",
                border: "border-amber-300/20 light:border-amber-900/25",
                card: "theme-surface bg-stone-950/70 light:bg-amber-50/85",
                overlay: "bg-black/30 light:bg-white/45",
            },
            {
                image: bg("ancient/tunnel"),
                accent: "text-stone-200 light:text-stone-800",
                border: "border-stone-300/25 light:border-stone-700/25",
                card: "theme-surface bg-stone-950/65 light:bg-stone-100/80",
                overlay: "bg-black/35 light:bg-white/35",
            },
            {
                image: bg("ancient/louvre"),
                accent: "text-zinc-200 light:text-zinc-800",
                border: "border-zinc-200/20 light:border-zinc-800/25",
                card: "theme-surface bg-zinc-950/75 light:bg-zinc-100/85",
                overlay: "bg-black/30 light:bg-white/40",
            },
        ],
    },
} satisfies Record<string, MoodDefinition>;

export type Mood = keyof typeof themeMap;

export const moods = Object.keys(themeMap) as Mood[];

// Used for the homepage and anywhere no mood is selected.
export const defaultTheme: Theme = {
    label: "SniffNotes",
    image: bg("green/dewy-grass"),
    accent: "text-white light:text-stone-900",
    border: "border-white/10 light:border-stone-900/15",
    card: "theme-surface bg-slate-950/60 light:bg-white/70",
    overlay: "bg-black/30 light:bg-white/30",
};

export function isMood(value: string): value is Mood {
    return Object.hasOwn(themeMap, value);
}

// Matches a tag by key ("woodsy"), label ("Woody"), or alias ("Vanilla"), case-insensitively.
export function moodFromTag(tag: string): Mood | undefined {
    const value = tag.trim().toLowerCase();
    if (isMood(value)) return value;
    return moods.find((mood) => {
        const definition: MoodDefinition = themeMap[mood];
        return definition.label.toLowerCase() === value || definition.aliases.includes(value);
    });
}

// The mood's first photo theme. Stable, for cards and anything shown side by side.
export function getTheme(mood?: string): Theme {
    if (!mood || !isMood(mood)) return defaultTheme;
    const { label, themes } = themeMap[mood];
    return { label, ...themes[0] };
}

// A random photo theme from the mood, for full-page backgrounds.
export function pickTheme(mood?: string, random: () => number = Math.random): Theme {
    if (!mood || !isMood(mood)) return defaultTheme;
    const { label, themes } = themeMap[mood];
    return { label, ...themes[Math.floor(random() * themes.length)] };
}

// Every background photo with its mood, for the homepage mosaic.
export const allPhotos = moods.flatMap((mood) => themeMap[mood].themes.map((theme) => ({
    mood,
    image: theme.image,
    // The photo's own palette, so panels over it can match.
    palette: { card: theme.card, border: theme.border, accent: theme.accent },
})));

export type Palette = (typeof allPhotos)[number]["palette"];
