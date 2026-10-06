// Pulls perfumes from a PerfumAPI deployment into data/import/fragrances.csv and downloads
// bottle photos to public/fragrances/. Then run `npm run import:fragrances`.
//
// Usage: npm run fetch:perfumapi
// Reads PERFUMAPI_URL from .env.local. Perfumes already in the CSV (same source URL, or
// same name and brand) are skipped, so it's safe to re-run. Review the suggested tags.

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { themeMap } from "../utils/themeMap.ts";
import { csvField, readCsvRecords, slugify } from "./csv.mts";
import { suggestMoods } from "./suggest-moods.mts";

type Perfume = {
    name: string;
    brand: string | null;
    notes_top: string[] | null;
    notes_middle: string[] | null;
    notes_base: string[] | null;
    description: string | null;
    image_url: string | null;
    perfume_url: string | null;
};

const PAGE_SIZE = 100;
const COLUMNS = ["id", "name", "brand", "collection", "tags", "top", "mid", "base", "image", "description", "source_url"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = join(root, "data/import/fragrances.csv");
const apiUrl = process.env.PERFUMAPI_URL?.replace(/\/$/, "");

if (!apiUrl) {
    console.error("Set PERFUMAPI_URL in .env.local (e.g. http://localhost:9000).");
    process.exit(1);
}

async function fetchAllPerfumes(): Promise<Perfume[]> {
    const all: Perfume[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const response = await fetch(`${apiUrl}/perfumes?limit=${PAGE_SIZE}&offset=${offset}`);
        if (!response.ok) throw new Error(`PerfumAPI returned ${response.status} for /perfumes`);
        const body = await response.json();
        const page: Perfume[] = Array.isArray(body) ? body : body.perfumes ?? [];
        all.push(...page);
        if (page.length < PAGE_SIZE) return all;
    }
}

// Fragrantica names end with the brand ("Orange Tonic Azzaro").
function cleanName(name: string, brand: string) {
    const trimmed = name.trim();
    return brand && trimmed.toLowerCase().endsWith(` ${brand.toLowerCase()}`)
        ? trimmed.slice(0, -brand.length - 1).trim()
        : trimmed;
}

// Drops the stock note sentences ("Top notes are ...; base notes are ...", "The fragrance features ..."),
// which the notes card already shows.
function cleanDescription(description: string) {
    return description
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph
            .replace(/\s*Top notes? (is|are) [^.]*?base notes? (is|are) [^.]*\./i, "")
            .replace(/\s*The fragrance features [^.]*\./i, "")
            .trim())
        .filter(Boolean)
        .join("\n\n");
}

// Some perfumes only have a flat note list on Fragrantica: "The fragrance features A, B and C."
function featuredNotes(description: string) {
    const sentence = description.match(/The fragrance features ([^.]*)\./i)?.[1] ?? "";
    return sentence.split(/,\s*|\s+and\s+/).map((note) => note.trim()).filter(Boolean);
}

function list(values: string[] | null) {
    return (values ?? []).map((v) => v.trim()).filter(Boolean);
}

async function downloadImage(url: string, id: string) {
    const relative = `/fragrances/${id}.jpg`;
    const target = join(root, "public", relative);
    if (existsSync(target)) return relative;

    try {
        const response = await fetch(url);
        const type = response.headers.get("content-type") ?? "";
        if (!response.ok || !type.startsWith("image/")) return "";
        writeFileSync(target, Buffer.from(await response.arrayBuffer()));
        return relative;
    } catch {
        return "";
    }
}

const csvText = readFileSync(csvPath, "utf8");
const existing = readCsvRecords(csvText);
const knownSources = new Set(existing.map((row) => row.source_url).filter(Boolean));
const knownNames = new Set(existing.map((row) => `${row.name}|${row.brand}`.toLowerCase()));
const takenIds = new Set(existing.map((row) => row.id || slugify(row.name)));

// Add the source_url column to older CSVs before appending rows that use it.
const header = csvText.split(/\r?\n/, 1)[0].split(",").map((c) => c.trim().toLowerCase());
if (!header.includes("source_url")) {
    const [first, ...rest] = csvText.split(/\r?\n/);
    writeFileSync(csvPath, [`${first},source_url`, ...rest].join("\n"));
}

const perfumes = await fetchAllPerfumes();
const rows: string[] = [];
let skipped = 0;
let missingImages = 0;
const moodCounts = new Map<string, number>();

for (const perfume of perfumes) {
    const brand = (perfume.brand ?? "").trim();
    const name = cleanName(perfume.name ?? "", brand);
    const source = perfume.perfume_url ?? "";

    if (!name || !brand || knownSources.has(source) || knownNames.has(`${name}|${brand}`.toLowerCase())) {
        skipped++;
        continue;
    }

    let id = slugify(name);
    if (takenIds.has(id)) id = slugify(`${brand} ${name}`);
    if (takenIds.has(id)) {
        skipped++;
        continue;
    }

    const rawDescription = perfume.description ?? "";
    const top = list(perfume.notes_top);
    let mid = list(perfume.notes_middle);
    const base = list(perfume.notes_base);
    // Without a pyramid, the flat list goes in the middle tier (shown simply as "Notes").
    if (!top.length && !mid.length && !base.length) mid = featuredNotes(rawDescription);
    const description = cleanDescription(rawDescription) || `${name} by ${brand}.`;
    const moods = suggestMoods({ top, mid, base }, rawDescription);
    const image = perfume.image_url ? await downloadImage(perfume.image_url, id) : "";
    if (!image) missingImages++;

    moods.forEach((mood) => moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1));
    takenIds.add(id);
    knownSources.add(source);

    const record: Record<string, string> = {
        id,
        name,
        brand,
        collection: "",
        tags: moods.map((mood) => themeMap[mood].label).join(";"),
        top: top.join(";"),
        mid: mid.join(";"),
        base: base.join(";"),
        image,
        description,
        source_url: source,
    };
    rows.push(COLUMNS.map((column) => csvField(record[column])).join(","));
}

if (rows.length) {
    const current = readFileSync(csvPath, "utf8");
    appendFileSync(csvPath, (current.endsWith("\n") ? "" : "\n") + rows.join("\n") + "\n");
}

console.log(`Fetched ${perfumes.length} perfume(s) from ${apiUrl}.`);
console.log(`Added ${rows.length} to data/import/fragrances.csv; skipped ${skipped} already present or incomplete.`);
if (missingImages) console.log(`${missingImages} without a downloadable photo (they'll show a placeholder).`);
if (moodCounts.size) {
    console.log(`Suggested moods: ${[...moodCounts.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${themeMap[m as keyof typeof themeMap].label} ${n}`).join(", ")}`);
}
console.log("Review the tags column, then run: npm run import:fragrances");
