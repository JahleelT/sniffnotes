import FragranceHeader from "@/components/FragranceHeader";
import FragrancePhoto from "@/components/FragrancePhoto";
import BreakdownNTags from "@/components/BreakdownNTags";
import Description from "@/components/Description";
import Header from "@/components/Header";

export default function FragrancePage() {

    return (
        <div
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('/smokyBG.jpg')",
            }}
        >
            {/*bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 via-blue-900 via-blue-800*/}
            <Header/>
            <div className="min-h-screen bg-black/30">
                <FragranceHeader/>

                <div className="grid grid-cols-[1fr_0.9fr_1fr] gap-8 p-8">
                    <BreakdownNTags/>
                    <FragrancePhoto/>
                    <Description/>
                </div>
            </div>
                
        </div>
    )
}