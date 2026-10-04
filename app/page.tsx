import Backdrop from "@/components/Backdrop";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { defaultTheme } from "@/utils/themeMap";

export default function Home() {
  return (
    <Backdrop theme={defaultTheme}>

        <Header/>

        <main className="flex justify-center pt-32">

          <HeroSection/>

        </main>

    </Backdrop>
  );
}
