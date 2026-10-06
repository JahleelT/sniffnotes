import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";
import { defaultTheme, type Mood } from "@/utils/themeMap";

type HeroSectionProps = {
    moods: Mood[];
};


export default function HeroSection({ moods }: HeroSectionProps) {


    return (
        <section className={`w-full max-w-3xl flex flex-col items-center justify-center gap-6 p-6 sm:p-10 rounded-2xl border backdrop-blur-md ${defaultTheme.card} ${defaultTheme.border}`}>
            <h2 className=" text-2xl sm:text-3xl font-semibold text-center">What are you in the mood to sniff today?</h2>

            <div className="w-full">
                <SearchBar/>

                <MoodTags moods={moods}/>
            </div>
        </section> 
    )
}