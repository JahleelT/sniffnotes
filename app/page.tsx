import Backdrop from "@/components/Backdrop";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { getPreferences } from "@/lib/preferences";
import { defaultTheme, moods } from "@/utils/themeMap";

export default async function Home() {
  const { favoriteMoods } = await getPreferences();
  const orderedMoods = [...favoriteMoods, ...moods.filter((mood) => !favoriteMoods.includes(mood))];

  return (
    <Backdrop theme={defaultTheme}>

        <Header/>

        <main id="main" className="flex justify-center px-4 pt-12 sm:pt-32 pb-12">

          <HeroSection moods={orderedMoods}/>

        </main>

    </Backdrop>
  );
}
