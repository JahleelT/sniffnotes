import Link from "next/link";
import {Search, CircleUserRound, Calendar, Users, Bookmark} from "lucide-react";

const navItem = "relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full";

export default function Header() {



    return (
        <header className="sticky top-0 z-50 flex justify-between items-center cursor-pointer max-w-full p-6">
            <Link href="/" className="text-4xl font-semibold">SniffNotes</Link>
            <nav className="flex gap-8 items-center ">

                <button className={navItem}>
                    <Calendar/>
                </button>

                <Link href="/search" aria-label="Search" className={navItem}>
                    <Search/>
                </Link>

                <button className={navItem}>
                    <Users/>
                </button>

                <button className={navItem}>
                    <Bookmark/>
                </button>

                <button className={navItem}>
                    <CircleUserRound/>
                </button> {/*This will be the profile tab */}

            </nav>
        </header>
    );
}
