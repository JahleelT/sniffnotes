import { BackgroundPaletteProvider } from "@/components/BackgroundPalette";
import Header from "@/components/Header";
import HeaderBar from "@/components/HeaderBar";
import HeroSection from "@/components/HeroSection";
import MoodMosaic from "@/components/MoodMosaic";
import MoodSlideshow from "@/components/MoodSlideshow";
import { getPreferences } from "@/lib/preferences";
import { getFeaturedMoods, getPersonalRecommendations } from "@/lib/recommendations";
import { allPhotos, moods, themeMap, type Mood } from "@/utils/themeMap";

const MOSAIC_TILES = 12;

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Featured moods first (so phones, which show 3 tiles, see them), then one photo per other mood,
// round after round until `count` photos are picked.
function choosePhotos(featuredMoods: Mood[], count: number) {
  const byMood = new Map(moods.map((mood) => [mood, shuffle(allPhotos.filter((p) => p.mood === mood))]));
  const moodOrder = [...featuredMoods, ...shuffle(moods.filter((mood) => !featuredMoods.includes(mood)))];
  const picked: (typeof allPhotos)[number][] = [];

  while (picked.length < count && [...byMood.values()].some((list) => list.length)) {
    for (const mood of moodOrder) {
      const next = byMood.get(mood)?.shift();
      if (next && picked.length < count) picked.push(next);
    }
  }
  return picked;
}

export default async function Home(props: PageProps<"/">) {
  // Trying out two backgrounds: the grid (default) and a single-photo slideshow (?bg=slideshow).
  const { bg } = await props.searchParams;
  const slideshow = bg === "slideshow";

  const [{ favoriteMoods }, featuredMoods, { picks }] = await Promise.all([
    getPreferences(),
    getFeaturedMoods(),
    getPersonalRecommendations(1),
  ]);
  const orderedMoods = [...favoriteMoods, ...moods.filter((mood) => !favoriteMoods.includes(mood))];

  const slides = slideshow
    ? choosePhotos(featuredMoods, allPhotos.length).map(({ image, mood, palette }) => ({ image, mood, palette, label: themeMap[mood].label }))
    : [];

  return (
    // In slideshow mode the search card starts with the first photo's palette, then follows the slideshow.
    <BackgroundPaletteProvider initial={slides[0]?.palette ?? null}>
    <div className="relative min-h-screen">
        {slideshow ? (
          <MoodSlideshow slides={slides}/>
        ) : (
          <MoodMosaic photos={allPhotos.map((p) => p.image)} initial={choosePhotos(featuredMoods, MOSAIC_TILES).map((p) => p.image)}/>
        )}

        <HeaderBar>
          <Header/>
        </HeaderBar>

        <main id="main" className="flex justify-center px-4 pt-10 sm:pt-24 pb-20">

          {/* Recommendations live on /for-you; the home page only links there, to keep it calm. */}
          <HeroSection moods={orderedMoods} hasPicks={picks.length > 0}/>

        </main>
    </div>
    </BackgroundPaletteProvider>
  );
}
