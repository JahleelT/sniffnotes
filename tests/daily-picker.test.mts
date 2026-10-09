import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseNextPick, dayNumber, localDate, sharedPickForDay, type PastPick } from "../lib/daily-picker.ts";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `f${i}`);

test("each cycle shows every fragrance exactly once, with no back-to-back repeats", () => {
    for (const n of [2, 6, 20]) {
        const history: PastPick[] = [];
        for (let day = 0; day < n * 10; day++) {
            const next = chooseNextPick(ids(n), history)!;
            if (history[0]) assert.notEqual(next.fragranceId, history[0].fragranceId);
            history.unshift(next);
        }
        for (let cycle = 1; cycle <= 10; cycle++) {
            const picks = history.filter((p) => p.cycle === cycle).map((p) => p.fragranceId);
            assert.equal(new Set(picks).size, n);
            assert.equal(picks.length, n);
        }
    }
});

test("fragrances added mid-cycle join the current cycle", () => {
    const history: PastPick[] = [];
    for (let d = 0; d < 2; d++) history.unshift(chooseNextPick(["a", "b", "c"], history)!);
    for (let d = 0; d < 3; d++) history.unshift(chooseNextPick(["a", "b", "c", "d", "e"], history)!);
    assert.deepEqual(new Set(history.filter((p) => p.cycle === 1).map((p) => p.fragranceId)), new Set(["a", "b", "c", "d", "e"]));
});

test("the shared pick covers every fragrance in each window and is the same for everyone", () => {
    const list = ids(6);
    for (let window = 0; window < 5; window++) {
        const picks = list.map((_, i) => sharedPickForDay(list, 6000 + window * 6 + i));
        assert.equal(new Set(picks).size, 6);
    }
    assert.equal(sharedPickForDay(list, 1234), sharedPickForDay([...list].reverse(), 1234));
});

test("local dates follow the visitor's time zone, falling back to UTC", () => {
    const instant = new Date("2026-10-06T02:30:00Z");
    assert.equal(localDate("America/New_York", instant), "2026-10-05");
    assert.equal(localDate("Not/AZone", instant), "2026-10-06");
    assert.equal(dayNumber("1970-01-02"), 1);
});
