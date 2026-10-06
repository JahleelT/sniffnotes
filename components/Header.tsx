import Link from "next/link";
import {Search, CircleUserRound, Calendar, Users, Bookmark, Settings, LogIn, Sparkles} from "lucide-react";
import NavLink from "@/components/NavLink";
import { getCurrentUser } from "@/lib/auth";

const navItem = "relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full";
const icon = "size-5 sm:size-6";

export default async function Header() {
    const user = await getCurrentUser();

    return (
        <header className="sticky top-0 z-50 flex justify-between items-center gap-4 cursor-pointer max-w-full p-4 sm:p-6">
            <Link href="/" className="text-xl min-[400px]:text-2xl sm:text-4xl font-semibold">SniffNotes</Link>
            <nav aria-label="Main" className="flex gap-2.5 min-[400px]:gap-3 sm:gap-8 items-center">

                <NavLink href="/daily" label="Fragrance of the day" className={navItem}>
                    <Calendar aria-hidden className={icon}/>
                </NavLink>

                <NavLink href="/search" label="Search" className={navItem}>
                    <Search aria-hidden className={icon}/>
                </NavLink>

                <NavLink href="/for-you" label="Picked for you" className={navItem}>
                    <Sparkles aria-hidden className={icon}/>
                </NavLink>

                <NavLink href="/friends" label="Friends" className={navItem}>
                    <Users aria-hidden className={icon}/>
                </NavLink>

                <NavLink href="/collections" label="Collections" className={navItem}>
                    <Bookmark aria-hidden className={icon}/>
                </NavLink>

                <NavLink href="/settings" label="Settings" className={navItem}>
                    <Settings aria-hidden className={icon}/>
                </NavLink>

                {user ? (
                    <NavLink href="/account" label={`Account for ${user.displayName}`} className={navItem}>
                        <CircleUserRound aria-hidden className={icon}/>
                    </NavLink>
                ) : (
                    <Link href="/sign-in" aria-label="Sign in" className={`${navItem} text-lg font-medium`}>
                        <LogIn aria-hidden className={`${icon} sm:hidden`}/>
                        <span className="hidden sm:inline">Sign in</span>
                    </Link>
                )}

            </nav>
        </header>
    );
}
