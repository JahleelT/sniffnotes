import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";
import type { Mood } from "@/utils/themeMap";

type HeroSectionProps = {
    moods: Mood[];
};


export default function HeroSection({ moods }: HeroSectionProps) {


    return (
        <section className="flex flex-col items-center justify-center gap-6">
            <h2 className=" text-3xl font-semibold">What are you in the mood to sniff today?</h2>

            <div className="w-full max-w-3xl">
                <SearchBar/>

                <MoodTags moods={moods}/>
            </div>
        </section> 
    )
}