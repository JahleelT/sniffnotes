export default function BreakdownNTags() {

    return (
        <div className="flex flex-col justify-center px-4">
            <section id="notes">
                <h3 className="text-lg mt-4 font-semibold">Top Notes</h3>
                <ul className="mb-4">
                    <li>Bergamot</li>
                    <li className="font-semibold">Pink Peppercorn</li>
                    <li className="font-semibold">Raspberry</li>
                </ul>

                <h3 className="text-lg mt-4 font-semibold">Heart Notes</h3>
                <ul className="mb-4">
                    <li>Violet Leaves</li>
                    <li className="font-semibold">Cedarwood</li>
                    <li>Grey Amber</li>
                </ul>

                <h3 className="text-lg mt-4 font-semibold">Base Notes</h3>
                <ul className="mb-4">
                    <li>Patchouli</li>
                    <li>Vanilla</li>
                    <li className="font-semibold">Tobacco</li>
                    <li>Musk</li>
                    <li className="font-semibold">Leather</li>
                </ul>
            </section>
            <section id="tags" className="flex flex-wrap gap-2 mt-6">
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Fruity</button>
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Smoky</button>
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Leathery</button>
            </section>
        </div>
    )
}