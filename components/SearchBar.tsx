"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
    initialQuery?: string;
};

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();

    const handleSearch = () => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) return;

        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    };


    return (
        <input
            value = {query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSearch();
                }
            }}
            type="text"
            placeholder="Follow your nose..."
            className="w-full text-l px-8 py-4 rounded-full border"
        />
    )
}
