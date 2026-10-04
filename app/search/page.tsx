import type { Metadata } from "next";
import Backdrop from "@/components/Backdrop";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";
import FragranceCard from "@/components/FragranceCard";
import { searchFragrances } from "@/lib/fragrances";
import { getTheme, isMood, moods, themeMap } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Search | SniffNotes",
};

export default async function SearchPage(props: PageProps<"/search">) {
    const { q, mood } = await props.searchParams;

    const query = typeof q === "string" ? q.trim() : "";
    const activeMood = typeof mood === "string" && isMood(mood) ? mood : undefined;

    const results = searchFragrances({ query, mood: activeMood });
    const theme = getTheme(activeMood);

    const filters = [
        query && `“${query}”`,
        activeMood && themeMap[activeMood].label,
    ].filter(Boolean).join(" + ");

    return (
        <Backdrop theme={theme}>
            <div className={`backdrop-blur-sm border-b ${theme.card} ${theme.border}`}>
                <Header/>
            </div>

            <main className="max-w-6xl mx-auto px-8 py-10">
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
                    <p className="text-center text-lg text-white/80">
                        Nothing matched. Try a note like “vanilla”, a brand, or another mood.
                    </p>
                )}
            </main>
        </Backdrop>
    );
}
