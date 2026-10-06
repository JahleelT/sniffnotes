"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchHref, type SearchFilters } from "@/lib/search-params";

type SearchBarProps = {
    initialQuery?: string;
    // Other search filters to keep when the text changes.
    filters?: Partial<SearchFilters>;
};

export default function SearchBar({ initialQuery = "", filters = {} }: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = query.trim();

        // An empty search browses everything (within any other filters).
        router.push(searchHref({ ...filters, query: trimmedQuery }));
    };


    return (
        <form role="search" onSubmit={handleSearch} className="relative">
            <label htmlFor="fragrance-search" className="sr-only">Search fragrances by name, brand, note, or mood</label>
            <input
                id="fragrance-search"
                value = {query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                enterKeyHint="search"
                placeholder="Follow your nose..."
                className="w-full text-l pl-6 sm:pl-8 pr-16 py-4 rounded-full border"
            />
            <button
                type="submit"
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full hover:bg-foreground/15 transition-all duration-200 cursor-pointer"
            >
                <Search aria-hidden className="size-5"/>
            </button>
        </form>
    )
}
