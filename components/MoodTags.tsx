export default function MoodTags() {
    const moods = [
        "Tea",
        "Fruity",
        "Dark",
        "Smoky",
        "Woody",
        "Boozy",
        "Tropical",
        "Floral",
        "Spicy",
        "Clean",
        "Solar"
    ];  

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-6 w-full">
            {moods.map((mood) => (
                <button key={mood} className="px-6 py-3 rounded-full border border-gray-300 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">
                    {mood}
                </button>
            ))}
        </div>
    );
}




/*
const moods = [
        "Tea",
        "Fruity",
        "Dark",
        "Smoky",
        "Green",
        "Leathery",
        "Blue",
        "Woody",
        "Bright",
        "Effervescent",
        "Boozy",
        "Tropical",
        "Floral",
        "Spicy",
        "Clean",
        "Fresh",
        "Soapy",
        "Ancient",
        "Rainy",
        "Solar"
    ];
*/