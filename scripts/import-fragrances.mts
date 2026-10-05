// Builds data/fragrances.json from a CSV or JSON import file.
//
// Usage: npm run import:fragrances [-- path/to/file.csv|.json]
// Defaults to data/import/fragrances.csv. Nothing is written if any entry is invalid.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isMood, moods, themeMap, type Mood } from "../utils/themeMap.ts";
import { readCsvRecords, slugify } from "./csv.mts";

type RawEntry = Record<string, unknown>;

type Fragrance = {
    id: string;
    name: string;
    brand: string;
    collection?: string;
    image?: string;
    tags: Mood[];
    description: string;
    notes: { top: string[]; mid: string[]; base: string[] };
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = process.argv[2] ?? join(root, "data/import/fragrances.csv");
const outputPath = join(root, "data/fragrances.json");

function readEntries(path: string): RawEntry[] {
    const text = readFileSync(path, "utf8");

    if (extname(path).toLowerCase() === ".json") {
        const parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
        if (!Array.isArray(parsed)) throw new Error("JSON import file must contain an array of fragrances.");
        return parsed;
    }

    return readCsvRecords(text);
}

// Accepts either an array or a semicolon-separated string.
function list(value: unknown): string[] {
    const items = Array.isArray(value) ? value : String(value ?? "").split(";");
    return items.map((item) => String(item).trim()).filter(Boolean);
}

function text(value: unknown): string {
    return String(value ?? "").trim();
}

// Matches a tag by key ("woodsy") or label ("Woody"), case-insensitively.
function toMood(tag: string): Mood | undefined {
    const value = tag.toLowerCase();
    if (isMood(value)) return value;
    return moods.find((mood) => themeMap[mood].label.toLowerCase() === value);
}

const entries = readEntries(inputPath);
const errors: string[] = [];
const warnings: string[] = [];
const fragrances: Fragrance[] = [];
const seenIds = new Set<string>();
const isCsv = extname(inputPath).toLowerCase() !== ".json";

entries.forEach((entry, index) => {
    const name = text(entry.name);
    const brand = text(entry.brand);
    const where = `${isCsv ? `Row ${index + 2}` : `Entry ${index + 1}`}${name ? ` (${name})` : ""}`;
    const fail = (message: string) => errors.push(`${where}: ${message}`);

    const id = text(entry.id) || slugify(name);
    const description = text(entry.description);
    const notesSource = (entry.notes ?? {}) as RawEntry;
    const notes = {
        top: list(entry.top ?? notesSource.top),
        mid: list(entry.mid ?? notesSource.mid),
        base: list(entry.base ?? notesSource.base),
    };

    // Tags without a theme are skipped, not rejected, so they're picked up once themeMap gains that mood.
    const tags: Mood[] = [];
    const skippedTags: string[] = [];
    for (const tag of list(entry.tags)) {
        const mood = toMood(tag);
        if (!mood) skippedTags.push(tag);
        else if (!tags.includes(mood)) tags.push(mood);
    }
    if (skippedTags.length) warnings.push(`${where}: skipped tags without a theme: ${skippedTags.join(", ")}`);

    if (!name) fail("missing name");
    if (!brand) fail("missing brand");
    if (!description) fail("missing description");
    if (!tags.length) fail(`needs at least one themed tag. Valid tags: ${moods.map((m) => themeMap[m].label).join(", ")}`);
    if (!notes.top.length && !notes.mid.length && !notes.base.length) fail("needs at least one note");
    if (!id) fail("missing id");
    else if (seenIds.has(id)) fail(`duplicate id "${id}"`);
    seenIds.add(id);

    // A missing photo is left out so the site shows a placeholder until the file is added.
    let image: string | undefined = text(entry.image) || `/fragrances/${id}.jpg`;
    if (!existsSync(join(root, "public", image))) {
        warnings.push(`${where}: image not found at public${image}; using placeholder`);
        image = undefined;
    }

    const collection = text(entry.collection);
    fragrances.push({ id, name, brand, ...(collection && { collection }), ...(image && { image }), tags, description, notes });
});

if (errors.length) {
    console.error(`Import failed with ${errors.length} error(s); data/fragrances.json was not changed.\n`);
    errors.forEach((error) => console.error(`  ✗ ${error}`));
    process.exit(1);
}

writeFileSync(outputPath, JSON.stringify(fragrances, null, 4) + "\n");

warnings.forEach((warning) => console.warn(`  ! ${warning}`));
console.log(`Imported ${fragrances.length} fragrance(s) from ${relative(root, inputPath)} → ${relative(root, outputPath)}`);
