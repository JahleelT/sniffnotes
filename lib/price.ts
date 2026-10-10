// Rough price tiers, like restaurant $ signs: what a full bottle (about 100 ml / 3.4 oz) usually
// costs at retail in US dollars. Meant as a guide for comparing, not a quote.

export type PriceTier = 1 | 2 | 3 | 4;

export const PRICE_TIERS: Record<PriceTier, { symbol: string; label: string; range: string }> = {
    1: { symbol: "$", label: "Affordable", range: "under $75" },
    2: { symbol: "$$", label: "Mid-range", range: "$75–$150" },
    3: { symbol: "$$$", label: "Premium", range: "$150–$300" },
    4: { symbol: "$$$$", label: "Luxury", range: "over $300" },
};

export const priceTiers = Object.keys(PRICE_TIERS).map(Number) as PriceTier[];

export function isPriceTier(value: unknown): value is PriceTier {
    return value === 1 || value === 2 || value === 3 || value === 4;
}

// "$$", "2" or 2 → 2. Anything else → undefined.
export function parsePriceTier(value: unknown): PriceTier | undefined {
    const text = String(value ?? "").trim();
    const tier = /^\$+$/.test(text) ? text.length : Number(text);
    return isPriceTier(tier) ? tier : undefined;
}

export function describePrice(tier: PriceTier) {
    const { symbol, label, range } = PRICE_TIERS[tier];
    return `${symbol} · ${label}, ${range} for a full bottle`;
}

// A brand's usual tier, used when a fragrance's row doesn't set its own. Keys are lowercase.
// Lines priced differently from the rest of their brand set `price` in data/import/fragrances.csv.
export const BRAND_PRICE: Record<string, PriceTier> = {
    // Already in the catalog
    "angel schlesser": 1,
    "arabiyat prestige": 1,
    "astre": 3,
    "azzaro": 1,
    "banana republic": 1,
    "byredo": 3,
    "caron": 3,
    "creed": 4,
    "dior": 2,
    "divine": 3,
    "givenchy": 2,
    "guerlain": 2,
    "hermès": 2,
    "lanvin": 1,
    "mancera": 3,
    "mind games": 3,
    "robert piguet": 3,
    "santa maria novella": 3,
    "widian": 4,

    // Common brands, so new imports get a tier without extra work
    "acqua di parma": 3,
    "amouage": 4,
    "ariana grande": 1,
    "armaf": 1,
    "bath & body works": 1,
    "burberry": 2,
    "calvin klein": 1,
    "carolina herrera": 2,
    "chanel": 3,
    "comme des garçons": 2,
    "diptyque": 3,
    "dolce & gabbana": 2,
    "frederic malle": 4,
    "giorgio armani": 2,
    "gucci": 2,
    "hugo boss": 1,
    "initio": 4,
    "jean paul gaultier": 2,
    "jo malone london": 3,
    "juliette has a gun": 2,
    "kayali": 2,
    "kilian": 4,
    "lancôme": 2,
    "lattafa": 1,
    "le labo": 4,
    "louis vuitton": 4,
    "maison francis kurkdjian": 4,
    "maison margiela": 3,
    "marc jacobs": 2,
    "montale": 2,
    "montblanc": 1,
    "mugler": 2,
    "narciso rodriguez": 2,
    "nishane": 3,
    "paco rabanne": 2,
    "parfums de marly": 4,
    "penhaligon's": 3,
    "prada": 2,
    "serge lutens": 3,
    "tom ford": 3,
    "valentino": 2,
    "versace": 1,
    "viktor&rolf": 2,
    "xerjoff": 4,
    "yves saint laurent": 2,
    "zara": 1,
};
