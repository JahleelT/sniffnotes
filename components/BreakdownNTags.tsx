export default function BreakdownNTags() {

    return (
        <div className="flex flex-col justify-center px-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-6">
            <section id="notes">

                <h2 className="text-3xl mt-3 px-2 font-semibold">Notes</h2>

                <h3 className="flex text-2xl mt-4 font-semibold mb-1 justify-center">Top Notes</h3>
                {/*
                <ul className="mb-4">
                    <li className="text-xl">Bergamot</li>
                    <li className="font-semibold text-xl">Pink Peppercorn</li>
                    <li className="font-semibold text-xl">Raspberry</li>
                </ul>
                */}
                <p className="flex justify-center text-xl">Bergamot, Pink Peppercorn, Raspberry</p>

                <hr className="my-6 border-gray-500"/>

                <h3 className="flex justify-center text-2xl mt-4 mb-1 font-semibold">Heart Notes</h3>
                {/*
                <ul className="mb-4">
                    <li className="text-xl">Violet Leaves</li>
                    <li className="font-semibold text-xl">Cedarwood</li>
                    <li className="text-xl">Grey Amber</li>
                </ul>
                */}
                <p className="flex justify-center text-xl">Violet Leaves, Cedarwood, Grey Amber</p>

                <hr className="my-6 border-gray-500"/>

                <h3 className="flex justify-center text-2xl mt-4 font-semibold mb-1">Base Notes</h3>
                {/*
                <ul>
                    <li className="text-xl">Patchouli</li>
                    <li className="text-xl">Vanilla</li>
                    <li className="font-semibold text-xl">Tobacco</li>
                    <li className="text-xl">Musk</li>
                    <li className="font-semibold text-xl">Leather</li>
                </ul>
                */}
                <p className="flex justify-center text-xl">Patchouli, Vanilla, Tobacco, Musk, Leather</p>
            </section>

            <hr className="my-6 border-gray-500 mb-1 mt-4"/>

            <h2 className="flex justify-center py-2 mb-2 text-2xl font-semibold">Fragrance Attributes</h2>
            <section id="tags" className="flex flex-wrap justify-center gap-2 mb-7">
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Fruity</button>
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Smoky</button>
                <button className="px-4 py-2 border rounded-full border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Leathery</button>
            </section>
        </div>
    )
}