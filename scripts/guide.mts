// Manhattan fragrance guide data.
//
//   npm run guide:fetch    add perfume shops from OpenStreetMap to data/guide/stores.csv (as unverified)
//   npm run guide:import   check data/guide/stores.csv and write data/guide/stores.json for the site
//
// The CSV is the source of truth: edit types, notes, and `verified` there. Fetching never changes
// existing rows; it only appends stores it hasn't seen (matched by OpenStreetMap id or name + address).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NEIGHBORHOODS, STORE_TYPES, type StoreType } from "../lib/guide-areas.ts";
import { csvField, readCsvRecords, slugify } from "./csv.mts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = join(root, "data/guide/stores.csv");
const jsonPath = join(root, "data/guide/stores.json");
const COLUMNS = ["name", "type", "neighborhood", "address", "website", "carries", "custom_blends", "verified", "note", "lat", "lon", "osm_id"];

const OVERPASS_QUERY = `[out:json][timeout:60];
area["name"="Manhattan"]["boundary"="administrative"]["admin_level"="7"]->.m;
(nwr["shop"="perfumery"](area.m);nwr["shop"="cosmetics"]["perfume"="yes"](area.m););
out center tags;`;
// NYC Open Data: 2020 Neighborhood Tabulation Areas.
const NTA_URL = "https://data.cityofnewyork.us/api/geospatial/9nt8-h7nd?method=export&format=GeoJSON";

// Typos and variants seen in OpenStreetMap names.
const NAME_FIXES: Record<string, string> = {
    "penhalgion's": "Penhaligon's",
    "santa maria nobella": "Santa Maria Novella",
    "diptyque'": "Diptyque",
    "le labo fragrances": "Le Labo",
    "bond no. 9": "Bond No. 9",
};

// Stores whose type is well established; everything else starts as a general "Perfume shop".
const BOUTIQUES = ["le labo", "diptyque", "bond no. 9", "jo malone", "initio", "penhaligon", "fueguia", "santa maria novella", "commodity", "byredo", "creed", "maison francis kurkdjian", "d.s. & durga", "mizensir", "trvdon", "trudon"];
const PERFUMERIES = ["aedes", "osswald", "scent bar"];

type Ring = [number, number][];

function pointInRing([x, y]: [number, number], ring: Ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

function inPolygon(point: [number, number], polygon: Ring[]) {
    return pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

async function fetchJson(url: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, headers: { "User-Agent": "SniffNotes guide builder", ...init?.headers }, signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
}

function readRows() {
    return existsSync(csvPath) ? readCsvRecords(readFileSync(csvPath, "utf8")) : [];
}

async function fetchStores() {
    const [osm, nta] = await Promise.all([
        fetchJson("https://overpass-api.de/api/interpreter", { method: "POST", body: new URLSearchParams({ data: OVERPASS_QUERY }) }),
        fetchJson(NTA_URL),
    ]);

    const areas = (nta.features as { properties: { ntaname: string; boroname: string }; geometry: { type: string; coordinates: unknown } }[])
        .filter((f) => f.properties.boroname === "Manhattan")
        .map((f) => ({
            name: f.properties.ntaname,
            polygons: (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as Ring[][],
        }));

    const brands = new Map<string, string>();
    for (const f of JSON.parse(readFileSync(join(root, "data/fragrances.json"), "utf8")) as { brand: string }[]) {
        brands.set(f.brand.toLowerCase(), slugify(f.brand));
    }

    const existing = readRows();
    const known = new Set(existing.flatMap((r) => [r.osm_id, `${r.name}|${r.address}`.toLowerCase()]).filter(Boolean));
    const added: string[] = [];
    let skipped = 0;

    for (const element of osm.elements as { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[]) {
        const tags = element.tags ?? {};
        const rawName = (tags.name ?? "").trim();
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        if (!rawName || lat === undefined || lon === undefined) { skipped++; continue; }

        const name = NAME_FIXES[rawName.toLowerCase()] ?? rawName;
        const lower = name.toLowerCase();
        const address = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
        const osmId = `${element.type}/${element.id}`;
        if (known.has(osmId) || known.has(`${name}|${address}`.toLowerCase())) { skipped++; continue; }

        const area = areas.find((a) => a.polygons.some((polygon) => inPolygon([lon, lat], polygon)));
        if (!area) { skipped++; continue; }

        const type: StoreType = BOUTIQUES.some((b) => lower.startsWith(b)) ? "boutique" : PERFUMERIES.some((p) => lower.startsWith(p)) ? "perfumery" : "shop";
        const carries = [...brands].filter(([brand]) => lower.includes(brand)).map(([, slug]) => slug);
        const record: Record<string, string> = {
            name, type, neighborhood: area.name, address,
            website: tags.website ?? tags["contact:website"] ?? "",
            carries: carries.join(";"), custom_blends: "no", verified: "no", note: "",
            lat: lat.toFixed(6), lon: lon.toFixed(6), osm_id: osmId,
        };
        added.push(COLUMNS.map((c) => csvField(record[c])).join(","));
        known.add(osmId);
    }

    const header = existsSync(csvPath) ? "" : `${COLUMNS.join(",")}\n`;
    const current = existsSync(csvPath) ? readFileSync(csvPath, "utf8") : "";
    writeFileSync(csvPath, header + current + (current && !current.endsWith("\n") ? "\n" : "") + added.map((row) => `${row}\n`).join(""));
    console.log(`Added ${added.length} store(s) to data/guide/stores.csv as unverified; skipped ${skipped} (already listed, unnamed, or outside Manhattan).`);
    console.log("Review them (type, note, verified), then run: npm run guide:import");
}

function importStores() {
    const errors: string[] = [];
    const brandSlugs = new Set((JSON.parse(readFileSync(join(root, "data/fragrances.json"), "utf8")) as { brand: string }[]).map((f) => slugify(f.brand)));

    const stores = readRows().map((row, i) => {
        const where = `Row ${i + 2} (${row.name || "no name"})`;
        if (!row.name) errors.push(`${where}: missing name`);
        if (!(row.type in STORE_TYPES)) errors.push(`${where}: type must be one of ${Object.keys(STORE_TYPES).join(", ")}`);
        if (!NEIGHBORHOODS.includes(row.neighborhood)) errors.push(`${where}: unknown neighborhood "${row.neighborhood}"`);
        const carries = row.carries.split(";").map((s) => s.trim()).filter(Boolean);
        carries.filter((slug) => !brandSlugs.has(slug)).forEach((slug) => errors.push(`${where}: carries unknown brand "${slug}"`));
        const lat = Number(row.lat), lon = Number(row.lon);

        return {
            id: slugify(`${row.name} ${row.address || row.neighborhood}`),
            name: row.name,
            type: row.type as StoreType,
            neighborhood: row.neighborhood,
            address: row.address,
            website: /^https?:\/\//.test(row.website) ? row.website : "",
            carries,
            customBlends: row.custom_blends.toLowerCase() === "yes" || row.type === "custom",
            verified: row.verified.toLowerCase() === "yes",
            note: row.note,
            ...(Number.isFinite(lat) && Number.isFinite(lon) && row.lat ? { lat, lon } : {}),
        };
    });

    if (errors.length) {
        console.error(`Guide import failed with ${errors.length} error(s); data/guide/stores.json was not changed.\n`);
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }

    writeFileSync(jsonPath, `${JSON.stringify(stores, null, 4)}\n`);
    console.log(`Imported ${stores.length} store(s) (${stores.filter((s) => s.verified).length} verified) → data/guide/stores.json`);
}

const command = process.argv[2];
if (command === "fetch") await fetchStores();
else if (command === "import") importStores();
else {
    console.error("Usage: node scripts/guide.mts fetch|import");
    process.exit(1);
}
