import assert from "node:assert/strict";
import { test } from "node:test";
import type { Fragrance } from "../data/fragrances.ts";
import { buildIndex, recommendFor, similarTo, topMoods } from "../lib/recommend.ts";

const make = (id: string, tags: string[], top: string[], mid: string[], base: string[]) =>
    ({ id, name: id, brand: "B", tags, description: "", notes: { top, mid, base } }) as unknown as Fragrance;

const index = buildIndex([
    make("rose-oud", ["dark"], ["Saffron"], ["Bulgarian Rose"], ["Oud", "Musk"]),
    make("rose-oud-2", ["dark"], ["Pink Pepper"], ["Turkish Rose"], ["Agarwood", "Musk"]),
    make("citrus", ["solar"], ["Italian Lemon", "Bergamot"], ["Neroli"], ["Musk"]),
    make("vanilla", ["gourmand"], ["Rum"], ["Tonka Bean"], ["Madagascar Vanilla", "Musk"]),
]);

test("origin variants count as the same note (Bulgarian/Turkish Rose, Oud/Agarwood)", () => {
    const [top] = similarTo(index, "rose-oud", 1);
    assert.equal(top.fragrance.id, "rose-oud-2");
    assert.ok(top.sharedNotes.includes("Turkish Rose"));
});

test("a fragrance is never similar to itself", () => {
    assert.ok(similarTo(index, "rose-oud").every((r) => r.fragrance.id !== "rose-oud"));
});

test("personal picks leave out saved fragrances and name the closest saved one", () => {
    const picks = recommendFor(index, [{ fragranceId: "rose-oud", weight: 1 }], []);
    assert.ok(picks.every((p) => p.fragrance.id !== "rose-oud"));
    assert.equal(picks[0].fragrance.id, "rose-oud-2");
    assert.equal(picks[0].because?.id, "rose-oud");
});

test("favorite moods drive picks before anything is saved", () => {
    assert.equal(recommendFor(index, [], ["gourmand"])[0].fragrance.id, "vanilla");
    assert.equal(recommendFor(index, [], []).length, 0);
});

test("top moods are weighted by collection", () => {
    assert.deepEqual(topMoods(index, [{ fragranceId: "rose-oud", weight: 1 }, { fragranceId: "vanilla", weight: 0.4 }]), ["dark", "gourmand"]);
});
