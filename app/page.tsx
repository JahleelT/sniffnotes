import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/dewy_grass.jpg')",
      }}
    >
      <div className="min-h-screen bg-black/30">

        <Header/>

        <main className="flex justify-center pt-32">

          <HeroSection/>

        </main>

      </div>

    </div>
  );
}
