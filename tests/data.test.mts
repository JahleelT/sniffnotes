// Checks the committed data the site is built from.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { NEIGHBORHOODS, STORE_TYPES, friendlyNeighborhood } from "../lib/guide-areas.ts";
import { allPhotos, isMood, moodFromTag, moods, themeMap } from "../utils/themeMap.ts";

const read = (path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const publicFile = (path: string) => existsSync(new URL(`../public${path}`, import.meta.url));

test("every mood has at least one photo, and every photo exists", () => {
    for (const mood of moods) assert.ok(themeMap[mood].themes.length > 0, mood);
    for (const photo of allPhotos) assert.ok(publicFile(photo.image), photo.image);
});

test("tag aliases resolve to moods", () => {
    assert.equal(moodFromTag("Woody"), "woodsy");
    assert.equal(moodFromTag("Fresh"), "aquatic");
    assert.equal(moodFromTag("vanilla"), "gourmand");
    assert.equal(moodFromTag("Aromatic"), "green");
    assert.equal(moodFromTag("not a mood"), undefined);
});

test("fragrances have unique ids, valid moods, notes, and existing photos", () => {
    const fragrances = read("data/fragrances.json");
    assert.equal(new Set(fragrances.map((f: { id: string }) => f.id)).size, fragrances.length);
    for (const f of fragrances) {
        assert.ok(f.tags.length > 0 && f.tags.every(isMood), `${f.id}: tags`);
        assert.ok(f.notes.top.length + f.notes.mid.length + f.notes.base.length > 0, `${f.id}: notes`);
        if (f.image) assert.ok(publicFile(f.image), `${f.id}: ${f.image}`);
    }
});

test("guide stores use real neighborhoods and types", () => {
    for (const store of read("data/guide/stores.json")) {
        assert.ok(NEIGHBORHOODS.includes(store.neighborhood), `${store.name}: ${store.neighborhood}`);
        assert.ok(store.type in STORE_TYPES, `${store.name}: ${store.type}`);
    }
    assert.equal(new Set(NEIGHBORHOODS).size, NEIGHBORHOODS.length);
});

test("neighborhood names read naturally", () => {
    assert.equal(friendlyNeighborhood("SoHo-Little Italy-Hudson Square"), "SoHo, Little Italy & Hudson Square");
    assert.equal(friendlyNeighborhood("East Village"), "East Village");
});
