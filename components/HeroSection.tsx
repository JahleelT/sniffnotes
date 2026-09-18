import SearchBar from "@/components/SearchBar";
import MoodTags from "@/components/MoodTags";


export default function HeroSection() {


    return (
        <section className="flex flex-col items-center justify-center">
            <h2 className="justify-center text-xl font-semibold">What are you in the mood to sniff today?</h2>

            <div className="max-w-2xl">
                <SearchBar/>

                <MoodTags/>
            </div>
        </section>
    )
}