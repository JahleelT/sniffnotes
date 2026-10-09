import { BackgroundPaletteProvider } from "@/components/BackgroundPalette";
import Header from "@/components/Header";
import HeaderBar from "@/components/HeaderBar";
import HeroSection from "@/components/HeroSection";
import MoodSlideshow from "@/components/MoodSlideshow";
import { getPreferences } from "@/lib/preferences";
import { getFeaturedMoods, getPersonalRecommendations } from "@/lib/recommendations";
import { allPhotos, moods, themeMap, type Mood } from "@/utils/themeMap";

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Slideshow order: featured moods first, then one photo per other mood, round after round.
function orderPhotos(featuredMoods: Mood[]) {
  const byMood = new Map(moods.map((mood) => [mood, shuffle(allPhotos.filter((p) => p.mood === mood))]));
  const moodOrder = [...featuredMoods, ...shuffle(moods.filter((mood) => !featuredMoods.includes(mood)))];
  const picked: (typeof allPhotos)[number][] = [];

  while ([...byMood.values()].some((list) => list.length)) {
    for (const mood of moodOrder) {
      const next = byMood.get(mood)?.shift();
      if (next) picked.push(next);
    }
  }
  return picked;
}

export default async function Home() {
  const [{ favoriteMoods }, featuredMoods, { picks }] = await Promise.all([
    getPreferences(),
    getFeaturedMoods(),
    getPersonalRecommendations(1),
  ]);
  const orderedMoods = [...favoriteMoods, ...moods.filter((mood) => !favoriteMoods.includes(mood))];

  const slides = orderPhotos(featuredMoods).map(({ image, mood, palette }) => ({ image, mood, palette, label: themeMap[mood].label }));

  return (
    // The header and search card start with the first photo's palette, then follow the slideshow.
    <BackgroundPaletteProvider initial={slides[0]?.palette ?? null}>
    <div className="relative min-h-screen">
        <MoodSlideshow slides={slides}/>

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
