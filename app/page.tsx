import { cookies } from "next/headers";
import { BackgroundPaletteProvider } from "@/components/BackgroundPalette";
import Header from "@/components/Header";
import HeaderBar from "@/components/HeaderBar";
import HeroSection from "@/components/HeroSection";
import HomeBackground from "@/components/HomeBackground";
import { HOME_BACKGROUND_COOKIE } from "@/lib/home-background";
import { getPreferences } from "@/lib/preferences";
import { getFeaturedMoods, getPersonalRecommendations } from "@/lib/recommendations";
import { allPhotos, everydayMoods, moods, themeMap, type Mood } from "@/utils/themeMap";

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const GRID_TILES = 12;
const HOME_MOODS = 8;

// Featured moods first, then one photo per other mood, round after round.
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
  // A short list for the home page: favorites first, then everyday moods. Search has them all.
  const homeMoods = [...new Set([...favoriteMoods, ...everydayMoods])].slice(0, HOME_MOODS);

  const ordered = orderPhotos(featuredMoods);
  const slides = ordered.map(({ image, mood, palette }) => ({ image, mood, palette, label: themeMap[mood].label }));
  // One large photo by default; the grid if the visitor switched to it last time.
  const mode = (await cookies()).get(HOME_BACKGROUND_COOKIE)?.value === "grid" ? "grid" : "single";

  return (
    // In single-photo mode the header and search card start with the first photo's palette, then follow it.
    <BackgroundPaletteProvider initial={mode === "single" ? slides[0]?.palette ?? null : null}>
    <div className="relative min-h-screen">
        <HomeBackground
          initialMode={mode}
          slides={slides}
          gridInitial={ordered.slice(0, GRID_TILES).map((p) => p.image)}
          gridPhotos={allPhotos.map((p) => p.image)}
        />

        <HeaderBar>
          <Header/>
        </HeaderBar>

        <main id="main" className="flex justify-center px-4 pt-6 sm:pt-24 short:pt-4 pb-20 short:pb-6">

          {/* Recommendations live on /for-you; the home page only links there, to keep it calm. */}
          <HeroSection moods={homeMoods} hasPicks={picks.length > 0}/>

        </main>
    </div>
    </BackgroundPaletteProvider>
  );
}
