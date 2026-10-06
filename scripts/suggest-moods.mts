// Suggests SniffNotes moods for a fragrance from its notes and stated fragrance family.
// Suggestions are a starting point: review the tags column in data/import/fragrances.csv.

import type { Mood } from "../utils/themeMap.ts";

// Matched as whole words against each note, case-insensitively.
const noteKeywords: Record<Mood, string[]> = {
    tea: ["tea", "matcha", "mate", "black tea", "green tea", "white tea", "oolong", "earl grey"],
    fruity: ["berry", "berries", "raspberry", "strawberry", "blackberry", "blueberry", "black currant", "cassis", "peach", "plum", "apple", "pear", "fig", "cherry", "apricot", "lychee", "melon", "pomegranate", "fruit", "fruits", "quince", "rhubarb", "grape"],
    dark: ["oud", "agarwood", "leather", "patchouli", "labdanum", "castoreum", "birch", "black", "styrax", "myrrh"],
    smoky: ["smoke", "smoky", "incense", "olibanum", "frankincense", "cade", "birch tar", "tobacco", "guaiac wood", "burnt"],
    woodsy: ["cedar", "sandalwood", "vetiver", "wood", "woods", "woody notes", "oak", "oakmoss", "moss", "pine", "cypress", "cashmeran", "cashmere wood", "rosewood", "hinoki", "fir"],
    boozy: ["rum", "cognac", "whiskey", "whisky", "wine", "champagne", "gin", "liqueur", "absinthe", "brandy", "bourbon"],
    tropical: ["coconut", "mango", "pineapple", "passionfruit", "passion fruit", "frangipani", "tiare", "tiaré", "monoi", "banana", "papaya", "guava"],
    floral: ["rose", "jasmine", "tuberose", "iris", "violet", "lily", "orange blossom", "neroli", "gardenia", "peony", "magnolia", "ylang-ylang", "ylang", "mimosa", "heliotrope", "orchid", "freesia", "flowers", "floral", "honeysuckle", "carnation", "osmanthus", "geranium", "lilac"],
    spicy: ["pepper", "pink pepper", "black pepper", "cardamom", "cinnamon", "clove", "cloves", "nutmeg", "saffron", "ginger", "cumin", "anise", "star anise", "spices", "spicy"],
    clean: ["musk", "white musk", "aldehydes", "aldehyde", "soap", "cotton", "lily-of-the-valley", "powdery notes", "clean"],
    green: ["green notes", "galbanum", "grass", "leaf", "leaves", "fig leaf", "violet leaf", "basil", "mint", "tomato leaf", "petitgrain", "bamboo", "moss"],
    aquatic: ["sea notes", "marine", "water notes", "aquatic", "ozonic", "seaweed", "salt", "sea salt", "rain", "calone", "watery"],
    gourmand: ["vanilla", "honey", "caramel", "chocolate", "cocoa", "coffee", "tonka bean", "praline", "sugar", "almond", "milk", "cream", "toffee", "cappuccino"],
    resinous: ["amber", "benzoin", "labdanum", "myrrh", "olibanum", "frankincense", "elemi", "opoponax", "tolu balsam", "peru balsam", "resins", "styrax"],
    ancient: ["papyrus", "frankincense", "myrrh", "oud", "agarwood", "cedar"],
    solar: ["bergamot", "lemon", "orange", "mandarin", "mandarin orange", "grapefruit", "lime", "yuzu", "citrus", "citruses", "salt", "sea salt", "solar notes", "neroli"],
};

// Families from Fragrantica's "X by Y is a <Family> fragrance" sentence.
const familyKeywords: Record<string, Mood> = {
    floral: "floral",
    fruity: "fruity",
    woody: "woodsy",
    chypre: "woodsy",
    spicy: "spicy",
    oriental: "spicy",
    leather: "dark",
    citrus: "solar",
    aquatic: "aquatic",
    gourmand: "gourmand",
    amber: "resinous",
    fresh: "clean",
    aromatic: "clean",
    green: "green",
};

const FAMILY_WEIGHT = 3;
const MAX_MOODS = 3;

function matches(note: string, keyword: string) {
    return new RegExp(`(^|[^a-z])${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(note);
}

export function familyFromDescription(description: string): string[] {
    const sentence = description.match(/is an? (.+?) fragrance/i)?.[1] ?? "";
    return sentence.toLowerCase().split(/\s+/).filter((word) => word in familyKeywords);
}

// Top notes fade within minutes and citrus openers are nearly universal, so they count least.
const TIER_WEIGHT = { top: 0.5, mid: 1, base: 1 };

export function suggestMoods(notes: { top: string[]; mid: string[]; base: string[] }, description: string): Mood[] {
    const scores = new Map<Mood, number>();
    const add = (mood: Mood, points: number) => scores.set(mood, (scores.get(mood) ?? 0) + points);

    for (const tier of ["top", "mid", "base"] as const) {
        for (const note of notes[tier]) {
            for (const [mood, keywords] of Object.entries(noteKeywords) as [Mood, string[]][]) {
                if (keywords.some((keyword) => matches(note, keyword))) add(mood, TIER_WEIGHT[tier]);
            }
        }
    }

    // The first family word is the main accord, so it counts most.
    familyFromDescription(description).forEach((word, i) => add(familyKeywords[word], FAMILY_WEIGHT - Math.min(i, 1)));

    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([mood]) => mood);
    return ranked.length ? ranked.slice(0, MAX_MOODS) : ["floral"];
}
