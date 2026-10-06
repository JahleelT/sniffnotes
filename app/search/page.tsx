import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";
import FragranceCard from "@/components/FragranceCard";
import { searchFragrances } from "@/lib/fragrances";
import { isMood, moods, pickTheme, themeMap } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Search | SniffNotes",
};

export default async function SearchPage(props: PageProps<"/search">) {
    const { q, mood } = await props.searchParams;

    const query = typeof q === "string" ? q.trim() : "";
    const activeMood = typeof mood === "string" && isMood(mood) ? mood : undefined;

    const results = searchFragrances({ query, mood: activeMood });
    const theme = pickTheme(activeMood);

    const filters = [
        query && `“${query}”`,
        activeMood && themeMap[activeMood].label,
    ].filter(Boolean).join(" + ");

    return (
        <PageShell theme={theme}>
            <div className="max-w-3xl mx-auto">
                {/* key resets the input when the query changes through navigation */}
                <SearchBar key={query} initialQuery={query}/>
                <MoodTags moods={moods} active={activeMood} query={query}/>
            </div>

            <p className="mt-10 mb-6 text-xl text-center">
                {results.length} {results.length === 1 ? "fragrance" : "fragrances"}
                {filters ? ` for ${filters}` : ""}
            </p>

            {results.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6">
                    {results.map((fragrance) => (
                        <FragranceCard key={fragrance.id} fragrance={fragrance}/>
                    ))}
                </div>
            ) : (
                <p className="text-center text-lg text-foreground/80">
                    Nothing matched. Try a note like “vanilla”, a brand, or another mood.
                </p>
            )}
        </PageShell>
    );
}
