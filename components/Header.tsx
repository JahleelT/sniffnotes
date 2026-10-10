import Link from "next/link";
import { House, LogIn, MessageCircle, Newspaper, Search, Settings } from "lucide-react";
import { AccountMenu, DiscoverMenu, PhoneMenu } from "@/components/HeaderMenus";
import HeaderTitle from "@/components/HeaderTitle";
import NavLink from "@/components/NavLink";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/messages";

const navItem = "relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full";
const icon = "size-5 sm:size-6";

// Home, Search, News, and Messages sit directly in the header. From md up, the rest is grouped into the
// Discover and account menus; below md, a single menu holds everything.
export default async function Header() {
    const user = await getCurrentUser();
    const unread = await getUnreadMessageCount();

    return (
        <header className="flex justify-between items-center gap-4 cursor-pointer max-w-full p-4 sm:p-6 short:py-2">
            <HeaderTitle/>
            <nav aria-label="Main" className="flex gap-4 sm:gap-5 md:gap-7 items-center">

                {/* The title links home too, but not everyone expects that. */}
                <NavLink href="/" label="Home" className={`${navItem} md:text-lg md:font-medium`}>
                    <House aria-hidden className={`${icon} md:hidden`}/>
                    <span aria-hidden className="hidden md:inline">Home</span>
                </NavLink>

                <NavLink href="/search" label="Search" className={navItem}>
                    <Search aria-hidden className={icon}/>
                </NavLink>

                <div className="hidden md:block"><DiscoverMenu/></div>

                <NavLink href="/news" label="News" className={`${navItem} md:text-lg md:font-medium`}>
                    <Newspaper aria-hidden className={`${icon} md:hidden`}/>
                    <span aria-hidden className="hidden md:inline">News</span>
                </NavLink>

                {user && (
                    <NavLink href="/messages" label={unread ? `Messages (${unread} unread)` : "Messages"} className={navItem}>
                        <MessageCircle aria-hidden className={icon}/>
                        {unread > 0 && (
                            <span aria-hidden className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[0.625rem] leading-4 font-bold text-center">
                                {unread > 9 ? "9+" : unread}
                            </span>
                        )}
                    </NavLink>
                )}

                {user ? (
                    <div className="hidden md:block"><AccountMenu displayName={user.displayName}/></div>
                ) : (
                    <>
                        <NavLink href="/settings" label="Settings" className={`${navItem} hidden md:block`}>
                            <Settings aria-hidden className={icon}/>
                        </NavLink>
                        <Link href="/sign-in" aria-label="Sign in" className={`${navItem} text-lg font-medium`}>
                            <LogIn aria-hidden className={`${icon} sm:hidden`}/>
                            <span className="hidden sm:inline">Sign in</span>
                        </Link>
                    </>
                )}

                <div className="md:hidden"><PhoneMenu signedIn={Boolean(user)} displayName={user?.displayName}/></div>
            </nav>
        </header>
    );
}
