import FragranceHeader from "@/components/FragranceHeader";
import FragrancePhoto from "@/components/FragrancePhoto";
import BreakdownNTags from "@/components/BreakdownNTags";
import Description from "@/components/Description";

export default function FragrancePage() {

    return (
        <div
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('/AswanBackground.jpg')",
            }}
        >
            <div className="min-h-screen bg-black/30">
                <FragranceHeader/>

                <div className="grid grid-cols-3 gap-8 p-8">
                    <BreakdownNTags/>
                    <FragrancePhoto/>
                    <Description/>
                </div>
            </div>
                
        </div>
    )
}