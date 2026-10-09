import assert from "node:assert/strict";
import { test } from "node:test";
import { tagArticle } from "../lib/news-core.ts";

const brands = [
    { slug: "divine", name: "Divine" },
    { slug: "hermes", name: "Hermès" },
    { slug: "creed", name: "Creed" },
];
const fragrances = [
    { id: "divine", name: "Divine", brandSlug: "divine" },
    { id: "caleche", name: "Caleche", brandSlug: "hermes" },
    { id: "london", name: "London", brandSlug: "creed" },
];

test("brands match as proper nouns, so ordinary words don't tag them", () => {
    assert.deepEqual(tagArticle("A divine new rose from the house", brands, fragrances).brandSlugs, []);
    assert.deepEqual(tagArticle("Divine launches a new rose", brands, fragrances).brandSlugs, ["divine"]);
});

test("accents are ignored when matching brands", () => {
    assert.deepEqual(tagArticle("Hermes reissues Caleche", brands, fragrances), { brandSlugs: ["hermes"], fragranceIds: ["caleche"] });
});

test("a fragrance is only tagged alongside its brand", () => {
    assert.deepEqual(tagArticle("A rainy week in London", brands, fragrances).fragranceIds, []);
});
