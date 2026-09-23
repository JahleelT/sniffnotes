export default function BreakdownNTags() {

    return (
        <div className="flex flex-col justify-center px-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-6">
            <section id="notes">
                <h3 className="text-2xl mt-4 font-semibold">Top Notes</h3>
                <ul className="mb-4">
                    <li className="text-xl">Bergamot</li>
                    <li className="font-semibold text-xl">Pink Peppercorn</li>
                    <li className="font-semibold text-xl">Raspberry</li>
                </ul>

                <h3 className="text-2xl mt-4 font-semibold">Heart Notes</h3>
                <ul className="mb-4">
                    <li className="text-xl">Violet Leaves</li>
                    <li className="font-semibold text-xl">Cedarwood</li>
                    <li className="text-xl">Grey Amber</li>
                </ul>

                <h3 className="text-2xl mt-4 font-semibold">Base Notes</h3>
                <ul>
                    <li className="text-xl">Patchouli</li>
                    <li className="text-xl">Vanilla</li>
                    <li className="font-semibold text-xl">Tobacco</li>
                    <li className="text-xl">Musk</li>
                    <li className="font-semibold text-xl">Leather</li>
                </ul>
            </section>

            <hr className="my-6 border-gray-500 mb-1 mt-4"/>

            <h3 className="py-2 mb-2 text-2xl font-bold">Fragrance Attributes</h3>
            <section id="tags" className="flex flex-wrap gap-2 mb-7">
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Fruity</button>
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Smoky</button>
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Leathery</button>
            </section>
        </div>
    )
}