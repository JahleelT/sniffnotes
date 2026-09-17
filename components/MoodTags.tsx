export default function MoodTags() {
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

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-6">
            {moods.map((mood) => (
                <button key={mood} className="px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">
                    {mood}
                </button>
            ))}
        </div>
    );
}


