"use client";
import { useState } from "react";

export default function SearchBar() {
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) return;

        console.log(trimmedQuery);
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
            className="w-full px-6 py-4 rounded-full border" 
        />
    )
}