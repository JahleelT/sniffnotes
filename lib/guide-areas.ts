// Manhattan sections and neighborhoods for the fragrance guide. Neighborhood names are NYC's official
// 2020 Neighborhood Tabulation Areas (NYC Open Data), so stores can be placed by coordinates.
// No app imports (no `@/` paths): scripts/guide.mts uses this too.

export const STORE_TYPES = {
    boutique: { label: "Brand boutique", description: "One house's own shop" },
    perfumery: { label: "Multi-brand perfumery", description: "Curated niche and indie selections" },
    shop: { label: "Perfume shop", description: "Designer and everyday fragrances" },
    custom: { label: "Custom blends", description: "Scents made for you on the spot" },
} as const;

export type StoreType = keyof typeof STORE_TYPES;

// South to north.
export const SECTIONS = [
    {
        name: "Downtown",
        neighborhoods: [
            "Financial District-Battery Park City",
            "The Battery-Governors Island-Ellis Island-Liberty Island",
            "Tribeca-Civic Center",
            "SoHo-Little Italy-Hudson Square",
            "Chinatown-Two Bridges",
            "Lower East Side",
            "East Village",
            "Greenwich Village",
            "West Village",
        ],
    },
    {
        name: "Midtown",
        neighborhoods: [
            "Chelsea-Hudson Yards",
            "Midtown South-Flatiron-Union Square",
            "Gramercy",
            "Stuyvesant Town-Peter Cooper Village",
            "Murray Hill-Kips Bay",
            "Midtown-Times Square",
            "Hell's Kitchen",
            "East Midtown-Turtle Bay",
            "United Nations",
        ],
    },
    {
        name: "Upper East Side",
        neighborhoods: [
            "Upper East Side-Lenox Hill-Roosevelt Island",
            "Upper East Side-Carnegie Hill",
            "Upper East Side-Yorkville",
        ],
    },
    {
        name: "Upper West Side",
        neighborhoods: [
            "Upper West Side-Lincoln Square",
            "Upper West Side (Central)",
            "Upper West Side-Manhattan Valley",
            "Central Park",
        ],
    },
    {
        name: "Upper Manhattan",
        neighborhoods: [
            "Morningside Heights",
            "Manhattanville-West Harlem",
            "Harlem (South)",
            "Harlem (North)",
            "East Harlem (South)",
            "East Harlem (North)",
            "Randall's Island",
            "Hamilton Heights-Sugar Hill",
            "Washington Heights (South)",
            "Washington Heights (North)",
            "Highbridge Park",
            "Inwood",
            "Inwood Hill Park",
        ],
    },
] as const;

export const NEIGHBORHOODS: string[] = SECTIONS.flatMap((section) => [...section.neighborhoods]);

// "SoHo-Little Italy-Hudson Square" → "SoHo, Little Italy & Hudson Square"
export function friendlyNeighborhood(name: string) {
    const parts = name.split("-");
    return parts.length < 2 ? name : `${parts.slice(0, -1).join(", ")} & ${parts.at(-1)}`;
}
