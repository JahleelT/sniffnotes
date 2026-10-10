import Link from "next/link";
import { X } from "lucide-react";
import { getSearchFacets } from "@/lib/fragrances";
import { PRICE_TIERS, priceTiers } from "@/lib/price";
import { LONGEVITY_LEVELS, SEASONS, SILLAGE_LEVELS } from "@/lib/review-scales";
import { searchHref, type SearchFilters } from "@/lib/search-params";
import { themeMap } from "@/utils/themeMap";

type SearchFiltersFormProps = {
    filters: SearchFilters;
    cardClass: string;
};

const control = "w-full px-4 py-3 rounded-lg border border-foreground/30 bg-background/60";

// Labels for the chips above the results, with the filter each one removes.
function activeFilters(filters: SearchFilters) {
    return [
        filters.query && { label: `“${filters.query}”`, without: { ...filters, query: "" } },
        filters.mood && { label: themeMap[filters.mood].label, without: { ...filters, mood: undefined } },
        filters.brand && { label: `Brand: ${filters.brand}`, without: { ...filters, brand: undefined } },
        filters.line && { label: `Line: ${filters.line}`, without: { ...filters, line: undefined } },
        filters.note && { label: `Note: ${filters.note}`, without: { ...filters, note: undefined } },
        filters.price && { label: `Up to ${PRICE_TIERS[filters.price].symbol}`, without: { ...filters, price: undefined } },
        filters.longevity && { label: `Longevity: ${LONGEVITY_LEVELS[filters.longevity].label}`, without: { ...filters, longevity: undefined } },
        filters.sillage && { label: `Sillage: ${SILLAGE_LEVELS[filters.sillage].label}`, without: { ...filters, sillage: undefined } },
        filters.season && { label: `Season: ${SEASONS.find((s) => s.value === filters.season)!.label}`, without: { ...filters, season: undefined } },
    ].filter((chip): chip is { label: string; without: SearchFilters } => Boolean(chip));
}

export function ActiveFilterChips({ filters }: { filters: SearchFilters }) {
    const chips = activeFilters(filters);
    if (!chips.length) return null;

    return (
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Active filters">
            {chips.map((chip) => (
                <li key={chip.label}>
                    <Link
                        href={searchHref(chip.without)}
                        aria-label={`Remove filter ${chip.label}`}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-foreground/50 bg-foreground/10 hover:bg-foreground/20 transition-all duration-200"
                    >
                        {chip.label}
                        <X aria-hidden className="size-4"/>
                    </Link>
                </li>
            ))}
            {chips.length > 1 && (
                <li>
                    <Link href="/search" className="inline-flex px-4 py-1.5 underline text-foreground/80">Clear all</Link>
                </li>
            )}
        </ul>
    );
}

// A plain GET form, so filtering works without JavaScript and every result page has a shareable URL.
export default function SearchFiltersForm({ filters, cardClass }: SearchFiltersFormProps) {
    const { brands, lines, notes } = getSearchFacets();
    const open = Boolean(filters.brand || filters.line || filters.note || filters.price || filters.longevity || filters.sillage || filters.season);

    return (
        <details open={open} className={`p-4 sm:p-6 border rounded-xl backdrop-blur-sm ${cardClass}`}>
            <summary className="cursor-pointer font-semibold">Refine by brand, line, note, price, performance, or season</summary>

            <form action="/search" method="get" className="mt-4 grid gap-4 sm:grid-cols-3">
                {filters.query && <input type="hidden" name="q" value={filters.query}/>}
                {filters.mood && <input type="hidden" name="mood" value={filters.mood}/>}

                <label className="flex flex-col gap-1">
                    <span className="font-medium">Brand</span>
                    <select name="brand" defaultValue={filters.brand ?? ""} className={control}>
                        <option value="">Any brand</option>
                        {brands.map(({ brand, count }) => (
                            <option key={brand} value={brand}>{brand} ({count})</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="font-medium">Line</span>
                    <select name="line" defaultValue={filters.line ?? ""} className={control}>
                        <option value="">Any line</option>
                        {lines.map(({ line, brand, count }) => (
                            <option key={`${brand}-${line}`} value={line}>{brand} · {line} ({count})</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="font-medium">Note</span>
                    <input
                        name="note"
                        list="note-options"
                        defaultValue={filters.note ?? ""}
                        placeholder="e.g. vanilla, rose, oud"
                        className={control}
                    />
                    <datalist id="note-options">
                        {notes.map(({ note }) => <option key={note} value={note}/>)}
                    </datalist>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="font-medium">Price</span>
                    <select name="price" defaultValue={filters.price ?? ""} className={control}>
                        <option value="">Any price</option>
                        {priceTiers.map((tier) => (
                            <option key={tier} value={tier}>
                                Up to {PRICE_TIERS[tier].symbol} ({tier === 4 ? "anything" : PRICE_TIERS[tier].range.replace(/^\$\d+–/, "under ")})
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-foreground/70">Typical price for a full bottle.</span>
                </label>

                <fieldset className="sm:col-span-3 grid gap-4 sm:grid-cols-3">
                    <legend className="mb-2 text-sm text-foreground/70">Performance and season come from community reviews.</legend>

                    <label className="flex flex-col gap-1">
                        <span className="font-medium">Longevity</span>
                        <select name="longevity" defaultValue={filters.longevity ?? ""} className={control}>
                            <option value="">Any longevity</option>
                            {Object.entries(LONGEVITY_LEVELS).map(([value, { label }]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-medium">Sillage</span>
                        <select name="sillage" defaultValue={filters.sillage ?? ""} className={control}>
                            <option value="">Any sillage</option>
                            {Object.entries(SILLAGE_LEVELS).map(([value, { label }]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-medium">Season</span>
                        <select name="season" defaultValue={filters.season ?? ""} className={control}>
                            <option value="">Any season</option>
                            {SEASONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </label>
                </fieldset>

                <div className="sm:col-span-3 flex flex-wrap gap-3">
                    <button type="submit" className="px-6 py-3 rounded-full border border-foreground/60 font-semibold hover:bg-foreground/15 transition-all duration-200 cursor-pointer">
                        Apply filters
                    </button>
                </div>
            </form>
        </details>
    );
}
