import Link from "next/link";
import { searchHref, type SearchFilters } from "@/lib/search-params";
import { themeMap, type Mood } from "@/utils/themeMap";

type MoodTagsProps = {
    moods: Mood[];
    active?: Mood;
    // Other search filters to keep when a mood is toggled.
    filters?: Partial<SearchFilters>;
    className?: string;
};

// Each tag links to the search page filtered by that mood. Clicking the active tag clears it.
export default function MoodTags({ moods, active, filters = {}, className = "mt-6" }: MoodTagsProps) {

    const hrefFor = (mood: Mood) => searchHref({ ...filters, mood: mood === active ? undefined : mood });

    return (
        <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 w-full ${className}`}>
            {moods.map((mood) => (
                <Link
                    key={mood}
                    href={hrefFor(mood)}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-foreground/60 backdrop-blur-sm hover:bg-foreground/15 hover:scale-105 transition-all duration-200 cursor-pointer ${mood === active ? "bg-foreground/20" : ""}`}
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