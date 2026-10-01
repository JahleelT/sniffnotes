import Header from "@/components/Header";

/*
type FragranceHeaderProps = {
    name: string,
    brand: string,
    collection?: string,
};
*/

export default function FragranceHeader() {


    return (
        <div className=" w-full">
            <div className="mb-8 bg-slate-950/60 backdrop-blur-sm border border-b border-white/10">
                <Header/>
            </div>

            <div className="mb-2">
                <h1 className="text-5xl font-semibold text-center text-white">Aswan</h1>
                <h2 className=" mt-1 text-xl font-medium text-center text-white">Widian • Sapphire Collection</h2>
            </div>
            
        </div>
    );
}