import Link from "next/link";
import { Sparkles } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import HeroCard from "@/components/HeroCard";
import MoodTags from "@/components/MoodTags";
import type { Mood } from "@/utils/themeMap";

type HeroSectionProps = {
    moods: Mood[];
    hasPicks?: boolean;
};


export default function HeroSection({ moods, hasPicks = false }: HeroSectionProps) {


    return (
        <HeroCard title="What are you in the mood to sniff today?">

            <div className="w-full">
                <SearchBar/>

                <MoodTags moods={moods} compact className="mt-4 sm:mt-6"/>
            </div>

            {hasPicks && (
                <Link href="/for-you" className="inline-flex items-center gap-2 underline underline-offset-4 text-foreground/80 hover:text-foreground">
                    <Sparkles aria-hidden className="size-4"/>
                    See fragrances picked for you
                </Link>
            )}
        </HeroCard>
    )
}