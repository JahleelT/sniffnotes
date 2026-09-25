export default function BreakdownNTags() {

    return (
        <div className="flex flex-col justify-center px-4 bg-slate-950/60 backdrop-blur-sm border border-white/10 rounded-xl mb-6">
            <section id="notes">

                <h2 className="text-4xl mt-3 px-2 font-semibold">Notes</h2>

                <h3 className="flex text-3xl mt-4 font-semibold mb-1 justify-center">Top Notes</h3>
                {/*
                <ul className="mb-4">
                    <li className="text-xl">Bergamot</li>
                    <li className="font-semibold text-xl">Pink Peppercorn</li>
                    <li className="font-semibold text-xl">Raspberry</li>
                </ul>
                */}
                <p className="flex justify-center text-2xl">Bergamot, <b className="ml-1">Pink Peppercorn</b>, <b className="ml-1">Raspberry</b></p>

                <hr className="my-6 border-gray-500"/>

                <h3 className="flex justify-center text-3xl mt-4 mb-1 font-semibold">Heart Notes</h3>
                {/*
                <ul className="mb-4">
                    <li className="text-xl">Violet Leaves</li>
                    <li className="font-semibold text-xl">Cedarwood</li>
                    <li className="text-xl">Grey Amber</li>
                </ul>
                */}
                <p className="flex justify-center text-2xl">Violet Leaves, Cedarwood, Grey Amber</p>

                <hr className="my-6 border-gray-500"/>

                <h3 className="flex justify-center text-3xl mt-4 font-semibold mb-1">Base Notes</h3>
                {/*
                <ul>
                    <li className="text-xl">Patchouli</li>
                    <li className="text-xl">Vanilla</li>
                    <li className="font-semibold text-xl">Tobacco</li>
                    <li className="text-xl">Musk</li>
                    <li className="font-semibold text-xl">Leather</li>
                </ul>
                */}
                <p className="flex justify-center text-2xl">Patchouli, Vanilla, <b className="ml-1">Tobacco</b>, Musk, <b className="ml-1 mb-2">Leather</b></p>
            </section>

            <hr className="my-6 border-gray-500 mb-1 mt-4"/>

            <h2 className="flex justify-center py-2 mb-2 text-3xl font-semibold">Fragrance Attributes</h2>
            <section id="tags" className="flex flex-wrap justify-center gap-2 mb-7">
                <button className="px-4 py-2 border rounded-full text-xl border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Fruity</button>
                <button className="px-4 py-2 border rounded-full text-xl border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Smoky</button>
                <button className="px-4 py-2 border rounded-full text-xl border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">Leathery</button>
            </section>
        </div>
    )
}