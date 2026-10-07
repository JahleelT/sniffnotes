// Fetches fragrance news from publications' RSS/Atom feeds, tags the brands and fragrances each
// article mentions, and stores it. No app imports (no `@/` paths), so both the Next.js server
// (lib/news.ts) and the `npm run news:refresh` script can use it.

import type { SupabaseClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

export const NEWS_SOURCES = [
    { name: "Now Smell This", url: "https://nstperfume.com/feed/" },
    { name: "CaFleureBon", url: "https://www.cafleurebon.com/feed/" },
    { name: "Bois de Jasmin", url: "https://boisdejasmin.com/feed" },
    { name: "Perfumer & Flavorist", url: "https://www.perfumerflavorist.com/rss" },
    { name: "The Perfume Society", url: "https://www.perfumesociety.org/feed/" },
];

// Outlets publish a few posts a day, so checking every 4 hours keeps news fresh without hammering them.
export const NEWS_REFRESH_HOURS = 4;
// Older articles are dropped so the table stays small.
const KEEP_DAYS = 120;
const SUMMARY_LENGTH = 280;
const JOB_NAME = "news";

export type BrandRef = { slug: string; name: string };
export type FragranceRef = { id: string; name: string; brandSlug: string };

export type NewsRow = {
    url: string;
    title: string;
    source: string;
    published_at: string;
    summary: string;
    image_url: string | null;
    brand_slugs: string[];
    fragrance_ids: string[];
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text" });

type Node = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
    return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
    if (value === undefined || value === null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object" && "#text" in (value as Node)) return text((value as Node)["#text"]);
    return "";
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—" };

function decodeEntities(value: string) {
    return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
        if (code[0] === "#") {
            const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
            return Number.isFinite(n) ? String.fromCodePoint(n) : match;
        }
        return ENTITIES[code.toLowerCase()] ?? match;
    });
}

function plainText(html: string) {
    return decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "))
        .replace(/The post .{1,200}? appeared first on .{1,100}?\.\s*$/i, "")
        .replace(/\s+/g, " ")
        .trim();
}

function excerpt(value: string) {
    if (value.length <= SUMMARY_LENGTH) return value;
    const cut = value.slice(0, SUMMARY_LENGTH);
    return `${cut.slice(0, cut.lastIndexOf(" ") > 200 ? cut.lastIndexOf(" ") : SUMMARY_LENGTH).trim()}…`;
}

function httpUrl(value: string | undefined) {
    return value && /^https?:\/\//.test(value) ? value : null;
}

// Accents removed but case kept, so brand names match as proper nouns ("Divine", not "divine").
function stripAccents(value: string) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function wordPattern(name: string, flags = "") {
    const escaped = stripAccents(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, flags);
}

export function tagArticle(articleText: string, brands: BrandRef[], fragrances: FragranceRef[]) {
    const haystack = stripAccents(articleText);
    const brandSlugs = brands.filter((brand) => wordPattern(brand.name).test(haystack)).map((brand) => brand.slug);
    // Fragrance names are often ordinary words ("London", "Chrome"), so only count them alongside their brand.
    const fragranceIds = fragrances
        .filter((f) => brandSlugs.includes(f.brandSlug) && f.name.length >= 4 && wordPattern(f.name, "i").test(haystack))
        .map((f) => f.id);
    return { brandSlugs, fragranceIds };
}

function parseFeed(xml: string, source: string, brands: BrandRef[], fragrances: FragranceRef[]): NewsRow[] {
    const doc = parser.parse(xml) as Node;
    const rss = (doc.rss as Node | undefined)?.channel as Node | undefined;
    const atom = doc.feed as Node | undefined;
    const entries = asArray((rss?.item ?? atom?.entry) as Node | Node[] | undefined);

    return entries.flatMap((entry): NewsRow[] => {
        const title = plainText(text(entry.title));
        const link = typeof entry.link === "string"
            ? entry.link
            : text(asArray(entry.link as Node | Node[]).find((l) => !l["@_rel"] || l["@_rel"] === "alternate")?.["@_href"]);
        const url = httpUrl(link.trim());
        const date = new Date(text(entry.pubDate ?? entry["dc:date"] ?? entry.published ?? entry.updated));
        if (!title || !url || Number.isNaN(date.getTime())) return [];

        const bodyHtml = text(entry["content:encoded"] ?? entry.content ?? entry.description ?? entry.summary);
        const summarySource = plainText(text(entry.description ?? entry.summary) || bodyHtml);
        const media = (entry["media:content"] ?? entry["media:thumbnail"]) as Node | Node[] | undefined;
        const enclosure = asArray(entry.enclosure as Node | Node[]).find((e) => String(e["@_type"] ?? "").startsWith("image/"));
        const image = httpUrl(text(asArray(media)[0]?.["@_url"]))
            ?? httpUrl(text(enclosure?.["@_url"]))
            ?? httpUrl(bodyHtml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]);

        const { brandSlugs, fragranceIds } = tagArticle(`${title} ${plainText(bodyHtml)}`, brands, fragrances);

        return [{
            url,
            title: title.slice(0, 300),
            source,
            published_at: date.toISOString(),
            summary: excerpt(summarySource),
            image_url: image,
            brand_slugs: brandSlugs,
            fragrance_ids: fragranceIds,
        }];
    });
}

export async function fetchNews(brands: BrandRef[], fragrances: FragranceRef[]) {
    const results = await Promise.allSettled(NEWS_SOURCES.map(async ({ name, url }) => {
        const response = await fetch(url, {
            headers: { "User-Agent": "SniffNotes news reader (+https://github.com/JahleelT/sniffnotes)" },
            signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
        return parseFeed(await response.text(), name, brands, fragrances);
    }));

    const cutoff = Date.now() - KEEP_DAYS * 86_400_000;
    return {
        items: results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])).filter((item) => Date.parse(item.published_at) >= cutoff),
        errors: results.flatMap((r) => (r.status === "rejected" ? [String(r.reason?.message ?? r.reason)] : [])),
    };
}

// Marks a run as started if the last one is older than the refresh interval (or `force`).
// Returns false when another request already claimed it, so concurrent visits don't all fetch.
export async function claimNewsRun(admin: SupabaseClient, force = false) {
    await admin.from("job_runs").upsert({ name: JOB_NAME, last_run_at: new Date(0).toISOString() }, { onConflict: "name", ignoreDuplicates: true });

    let claim = admin.from("job_runs").update({ last_run_at: new Date().toISOString(), last_status: "running" }).eq("name", JOB_NAME);
    if (!force) claim = claim.lt("last_run_at", new Date(Date.now() - NEWS_REFRESH_HOURS * 3_600_000).toISOString());
    const { data } = await claim.select("name");
    return Boolean(data?.length);
}

export async function storeNews(admin: SupabaseClient, items: NewsRow[], errors: string[]) {
    // Feeds repeat items between fetches; the URL keeps them unique, and re-tagging picks up new brands.
    const unique = [...new Map(items.map((item) => [item.url, item])).values()];
    if (unique.length) {
        const { error } = await admin.from("news_items").upsert(unique, { onConflict: "url" });
        if (error) throw error;
    }
    await admin.from("news_items").delete().lt("published_at", new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString());

    const status = `${unique.length} articles${errors.length ? `; failed: ${errors.join(", ")}` : ""}`;
    await admin.from("job_runs").update({ last_status: status.slice(0, 500) }).eq("name", JOB_NAME);
    return status;
}
