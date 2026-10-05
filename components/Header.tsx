import Link from "next/link";
import {Search, CircleUserRound, Calendar, Users, Bookmark, Settings} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const navItem = "relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full";

export default async function Header() {
    const user = await getCurrentUser();

    return (
        <header className="sticky top-0 z-50 flex justify-between items-center cursor-pointer max-w-full p-6">
            <Link href="/" className="text-4xl font-semibold">SniffNotes</Link>
            <nav aria-label="Main" className="flex gap-8 items-center ">

                <button aria-label="Daily fragrance (coming soon)" title="Coming soon" className={navItem}>
                    <Calendar aria-hidden/>
                </button>

                <Link href="/search" aria-label="Search" title="Search" className={navItem}>
                    <Search aria-hidden/>
                </Link>

                <button aria-label="Friends (coming soon)" title="Coming soon" className={navItem}>
                    <Users aria-hidden/>
                </button>

                <button aria-label="Collections (coming soon)" title="Coming soon" className={navItem}>
                    <Bookmark aria-hidden/>
                </button>

                <Link href="/settings" aria-label="Settings" title="Settings" className={navItem}>
                    <Settings aria-hidden/>
                </Link>

                {user ? (
                    <Link href="/account" aria-label={`Account for ${user.displayName}`} title={user.displayName} className={navItem}>
                        <CircleUserRound aria-hidden/>
                    </Link>
                ) : (
                    <Link href="/sign-in" className={`${navItem} text-lg font-medium`}>
                        Sign in
                    </Link>
                )}

            </nav>
        </header>
    );
}
