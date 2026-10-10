// Content-based recommendation scoring. Pure functions over the dataset, no I/O.
//
// Each fragrance becomes a weighted feature vector of its notes (base notes weigh most, rare notes
// weigh more than common ones) and moods. Similarity is the cosine between vectors; a person's
// taste is the weighted sum of the fragrances they've saved.

import type { Fragrance } from "@/data/fragrances";
import type { Mood } from "@/utils/themeMap";

type Vector = Map<string, number>;

export type Recommendation = {
    fragrance: Fragrance;
    score: number;
    sharedNotes: string[];
    sharedMoods: Mood[];
    // For personal picks: the saved fragrance this one is most like.
    because?: Fragrance;
    // For "similar fragrances": how closely the moods line up, 0–100.
    moodMatch?: number;
};

const TIER_WEIGHT = { top: 0.7, mid: 1, base: 1.2 };
const MOOD_WEIGHT = 1.2;
const FIRST_MOOD_BONUS = 1.5;
const MIN_SCORE = 0.05;

// Origins and filler words that don't change what a note smells like.
const QUALIFIERS = new Set([
    "italian", "japanese", "hawaiian", "tunisian", "indonesian", "indian", "madagascar", "bulgarian", "turkish",
    "egyptian", "sri", "lankan", "haitian", "calabrian", "sicilian", "mysore", "australian", "virginia", "virginian",
    "atlas", "texas", "french", "moroccan", "brazilian", "mexican", "chinese", "persian", "laotian", "cambodian",
    "absolute", "accord", "essence", "oil", "co2", "co₂", "extract", "notes", "note", "sulawesi", "nectar",
]);

// Base materials: a note that mentions one also counts as that material ("Black Cardamom" → cardamom).
const MATERIALS: Record<string, string> = {
    cardamom: "cardamom", pepper: "pepper", sandalwood: "sandalwood", cedar: "cedar", cedarwood: "cedar",
    vanilla: "vanilla", rose: "rose", jasmine: "jasmine", musk: "musk", musks: "musk", amber: "amber",
    patchouli: "patchouli", vetiver: "vetiver", oud: "oud", agarwood: "oud", bergamot: "bergamot", lemon: "lemon",
    orange: "orange", mandarin: "mandarin", tea: "tea", leather: "leather", tobacco: "tobacco", iris: "iris",
    violet: "violet", neroli: "neroli", incense: "incense", olibanum: "incense", frankincense: "incense",
    ginger: "ginger", saffron: "saffron", cinnamon: "cinnamon", coffee: "coffee", honey: "honey", coconut: "coconut",
    mango: "mango", fig: "fig", tonka: "tonka", myrrh: "myrrh", labdanum: "labdanum", moss: "moss", oakmoss: "moss",
    lavender: "lavender", tuberose: "tuberose", raspberry: "raspberry", plum: "plum", peach: "peach",
};

function noteFeatures(note: string): string[] {
    const words = note.toLowerCase().replace(/[^a-z0-9₂\s-]/g, " ").split(/\s+/).filter(Boolean);
    const kept = words.filter((word) => !QUALIFIERS.has(word));
    const features = new Set<string>();

    if (kept.length) features.add(kept.join(" "));
    for (const word of kept) {
        const material = MATERIALS[word];
        if (material) features.add(material);
    }
    return [...features].map((feature) => `note:${feature}`);
}

// Feature key → the note text a person would recognize, for "Shares …" reasons.
function noteLabels(fragrance: Fragrance) {
    const labels = new Map<string, string>();
    for (const note of [...fragrance.notes.top, ...fragrance.notes.mid, ...fragrance.notes.base]) {
        for (const key of noteFeatures(note)) if (!labels.has(key)) labels.set(key, note);
    }
    return labels;
}

function normalize(vector: Vector): Vector {
    const length = Math.sqrt([...vector.values()].reduce((sum, v) => sum + v * v, 0));
    if (!length) return vector;
    return new Map([...vector].map(([key, value]) => [key, value / length]));
}

function cosine(a: Vector, b: Vector) {
    let dot = 0;
    for (const [key, value] of a) dot += value * (b.get(key) ?? 0);
    return dot; // both normalized
}

export function buildIndex(fragrances: Fragrance[]) {
    // How many fragrances each note feature appears in, for rarity weighting.
    const documentFrequency = new Map<string, number>();
    for (const fragrance of fragrances) {
        const keys = new Set([...fragrance.notes.top, ...fragrance.notes.mid, ...fragrance.notes.base].flatMap(noteFeatures));
        for (const key of keys) documentFrequency.set(key, (documentFrequency.get(key) ?? 0) + 1);
    }
    const rarity = (key: string) => Math.log(1 + fragrances.length / (documentFrequency.get(key) ?? 1));

    const vectors = new Map<string, Vector>();
    for (const fragrance of fragrances) {
        const vector: Vector = new Map();
        for (const tier of ["top", "mid", "base"] as const) {
            for (const note of fragrance.notes[tier]) {
                for (const key of noteFeatures(note)) {
                    vector.set(key, Math.max(vector.get(key) ?? 0, TIER_WEIGHT[tier] * rarity(key)));
                }
            }
        }
        fragrance.tags.forEach((mood, i) => vector.set(`mood:${mood}`, MOOD_WEIGHT * (i === 0 ? FIRST_MOOD_BONUS : 1)));
        vectors.set(fragrance.id, normalize(vector));
    }

    return { fragrances, vectors };
}

export type RecommendationIndex = ReturnType<typeof buildIndex>;

function explain(source: Vector, candidate: Fragrance, candidateVector: Vector) {
    const labels = noteLabels(candidate);
    const contributions = [...candidateVector]
        .map(([key, value]) => ({ key, weight: value * (source.get(key) ?? 0) }))
        .filter((c) => c.weight > 0)
        .sort((a, b) => b.weight - a.weight);

    const sharedNotes = [...new Set(contributions.filter((c) => c.key.startsWith("note:")).map((c) => labels.get(c.key)!))].slice(0, 3);
    const sharedMoods = contributions.filter((c) => c.key.startsWith("mood:")).map((c) => c.key.slice(5) as Mood);
    return { sharedNotes, sharedMoods };
}

function rank(index: RecommendationIndex, source: Vector, exclude: Set<string>, limit: number): Recommendation[] {
    return index.fragrances
        .filter((fragrance) => !exclude.has(fragrance.id))
        .map((fragrance) => {
            const vector = index.vectors.get(fragrance.id)!;
            return { fragrance, score: cosine(source, vector), ...explain(source, fragrance, vector) };
        })
        .filter((r) => r.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score || a.fragrance.name.localeCompare(b.fragrance.name))
        .slice(0, limit);
}

// Fragrances most like the one being viewed.
export function similarTo(index: RecommendationIndex, fragranceId: string, limit = 4): Recommendation[] {
    const source = index.vectors.get(fragranceId);
    return source ? rank(index, source, new Set([fragranceId]), limit) : [];
}

// How much two mood lists overlap, 0–100. Each fragrance's first (defining) mood counts extra,
// so Floral • Dark vs. Floral • Fruity scores higher than Dark • Floral vs. Floral • Fruity.
export function moodMatch(a: Mood[], b: Mood[]) {
    const weight = (i: number) => (i === 0 ? FIRST_MOOD_BONUS : 1);
    const total = (moods: Mood[]) => moods.reduce((sum, _, i) => sum + weight(i), 0);
    let shared = 0;
    a.forEach((mood, i) => {
        const j = b.indexOf(mood);
        if (j !== -1) shared += weight(i) + weight(j);
    });
    const denominator = total(a) + total(b);
    return denominator ? Math.round((100 * shared) / denominator) : 0;
}

// Fragrances whose moods match the one being viewed, best match first; notes break ties.
export function similarByMood(index: RecommendationIndex, fragranceId: string, limit = 8): Recommendation[] {
    const source = index.fragrances.find((f) => f.id === fragranceId);
    const sourceVector = index.vectors.get(fragranceId);
    if (!source || !sourceVector) return [];

    return index.fragrances
        .filter((fragrance) => fragrance.id !== fragranceId)
        .map((fragrance) => {
            const vector = index.vectors.get(fragrance.id)!;
            return {
                fragrance,
                score: cosine(sourceVector, vector),
                moodMatch: moodMatch(source.tags, fragrance.tags),
                ...explain(sourceVector, fragrance, vector),
            };
        })
        .filter((r) => r.moodMatch > 0)
        .sort((a, b) => b.moodMatch - a.moodMatch || b.score - a.score)
        .slice(0, limit);
}

export type TasteSignal = {
    fragranceId: string;
    weight: number;
};

// Personal picks from saved fragrances (weighted by collection) and favorite moods.
// Anything the person has already saved is left out.
export function recommendFor(
    index: RecommendationIndex,
    signals: TasteSignal[],
    favoriteMoods: Mood[],
    limit = 8,
): Recommendation[] {
    const profile: Vector = new Map();
    const add = (key: string, value: number) => profile.set(key, (profile.get(key) ?? 0) + value);

    for (const { fragranceId, weight } of signals) {
        for (const [key, value] of index.vectors.get(fragranceId) ?? []) add(key, value * weight);
    }
    // Favorite moods matter even with nothing saved yet.
    favoriteMoods.forEach((mood) => add(`mood:${mood}`, signals.length ? 0.5 : 1));

    if (!profile.size) return [];

    const saved = new Set(signals.map((s) => s.fragranceId));
    const picks = rank(index, normalize(profile), saved, limit);

    // Name the saved fragrance each pick is closest to.
    return picks.map((pick) => {
        const pickVector = index.vectors.get(pick.fragrance.id)!;
        const closest = [...saved]
            .map((id) => ({ id, score: cosine(index.vectors.get(id) ?? new Map(), pickVector) }))
            .sort((a, b) => b.score - a.score)[0];
        const because = closest && closest.score >= MIN_SCORE ? index.fragrances.find((f) => f.id === closest.id) : undefined;
        return { ...pick, because };
    });
}

// Moods weighted by how often they appear in someone's saved fragrances, strongest first.
export function topMoods(index: RecommendationIndex, signals: TasteSignal[], limit = 3): Mood[] {
    const counts = new Map<Mood, number>();
    for (const { fragranceId, weight } of signals) {
        const fragrance = index.fragrances.find((f) => f.id === fragranceId);
        fragrance?.tags.forEach((mood, i) => counts.set(mood, (counts.get(mood) ?? 0) + weight * (i === 0 ? 1.5 : 1)));
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([mood]) => mood);
}
