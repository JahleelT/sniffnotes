import Link from "next/link";
import { themeMap, type Mood } from "@/utils/themeMap";

type MoodTagsProps = {
    moods: Mood[];
    active?: Mood;
    query?: string;
    className?: string;
};

// Each tag links to the search page filtered by that mood. Clicking the active tag clears it.
export default function MoodTags({ moods, active, query, className = "mt-6" }: MoodTagsProps) {

    const hrefFor = (mood: Mood) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (mood !== active) params.set("mood", mood);
        const search = params.toString();
        return search ? `/search?${search}` : "/search";
    };

    return (
        <div className={`flex flex-wrap justify-center gap-3 w-full ${className}`}>
            {moods.map((mood) => (
                <Link
                    key={mood}
                    href={hrefFor(mood)}
                    className={`px-6 py-3 rounded-full border border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer ${mood === active ? "bg-white/25" : ""}`}
                >
                    {themeMap[mood].label}
                </Link>
            ))}
        </div>
    );
}




/*
const moods = [
        "Tea",
        "Fruity",
        "Dark",
        "Smoky",
        "Green",
        "Leathery",
        "Blue",
        "Woody",
        "Bright",
        "Effervescent",
        "Boozy",
        "Tropical",
        "Floral",
        "Spicy",
        "Clean",
        "Fresh",
        "Soapy",
        "Ancient",
        "Rainy",
        "Solar"
    ];
*/