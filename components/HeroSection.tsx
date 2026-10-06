import Link from "next/link";
import { Sparkles } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";
import { defaultTheme, type Mood } from "@/utils/themeMap";

type HeroSectionProps = {
    moods: Mood[];
    hasPicks?: boolean;
};


export default function HeroSection({ moods, hasPicks = false }: HeroSectionProps) {


    return (
        <section className={`w-full max-w-5xl flex flex-col items-center justify-center gap-6 p-6 sm:p-10 lg:px-14 rounded-2xl border backdrop-blur-md ${defaultTheme.card} ${defaultTheme.border}`}>
            <h2 className=" text-2xl sm:text-3xl font-semibold text-center">What are you in the mood to sniff today?</h2>

            <div className="w-full">
                <SearchBar/>

                <MoodTags moods={moods}/>
            </div>

            {hasPicks && (
                <Link href="/for-you" className="inline-flex items-center gap-2 underline underline-offset-4 text-foreground/80 hover:text-foreground">
                    <Sparkles aria-hidden className="size-4"/>
                    See fragrances picked for you
                </Link>
            )}
        </section> 
    )
}