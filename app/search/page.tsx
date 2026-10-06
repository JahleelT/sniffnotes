import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";
import FragranceCard from "@/components/FragranceCard";
import SearchFiltersForm, { ActiveFilterChips } from "@/components/SearchFiltersForm";
import { searchFragrances } from "@/lib/fragrances";
import { filterParams, hasFilters, parseSearchParams } from "@/lib/search-params";
import { moods, pickTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Search | SniffNotes",
};

export default async function SearchPage(props: PageProps<"/search">) {
    const filters = parseSearchParams(await props.searchParams);
    const results = searchFragrances(filters);
    const theme = pickTheme(filters.mood);

    return (
        <PageShell theme={theme}>
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                    {/* key resets the input when the filters change through navigation */}
                    <SearchBar key={JSON.stringify(filterParams(filters))} initialQuery={filters.query} filters={filters}/>
                    <MoodTags moods={moods} active={filters.mood} filters={filters}/>
                </div>

                <SearchFiltersForm filters={filters} cardClass={`${theme.card} ${theme.border}`}/>
                <ActiveFilterChips filters={filters}/>
            </div>

            <p className="mt-8 mb-6 text-xl text-center" role="status">
                {results.length} {results.length === 1 ? "fragrance" : "fragrances"}
                {hasFilters(filters) ? " match" : ""}
            </p>

            {results.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6">
                    {results.map((fragrance) => (
                        <FragranceCard key={fragrance.id} fragrance={fragrance}/>
                    ))}
                </div>
            ) : (
                <p className="text-center text-lg text-foreground/80">
                    Nothing matched. Try removing a filter, a note like “vanilla”, or another mood.
                </p>
            )}
        </PageShell>
    );
}
