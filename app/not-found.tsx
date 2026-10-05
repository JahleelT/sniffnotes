import Link from "next/link";
import Backdrop from "@/components/Backdrop";
import Header from "@/components/Header";
import { defaultTheme } from "@/utils/themeMap";

export default function NotFound() {
  return (
    <Backdrop theme={defaultTheme}>

        <Header/>

        <main id="main" className="flex flex-col items-center gap-6 pt-32 text-center">
          <h2 className="text-3xl font-semibold">We couldn&apos;t sniff that one out.</h2>
          <Link href="/search" className="px-6 py-3 rounded-full border border-foreground/60 backdrop-blur-sm hover:bg-foreground/15 transition-all duration-200">
            Browse fragrances
          </Link>
        </main>

    </Backdrop>
  );
}
