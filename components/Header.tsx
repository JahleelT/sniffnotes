import Link from "next/link";
import { CircleUserRound, LogIn } from "lucide-react";
import NavLink from "@/components/NavLink";
import NavMenu from "@/components/NavMenu";
import { navItems } from "@/components/navItems";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/messages";

const navItem = "relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full";
const icon = "size-5 sm:size-6";

export default async function Header() {
    const user = await getCurrentUser();
    const items = navItems.filter((item) => user || !item.signedIn);
    const unread = await getUnreadMessageCount();

    return (
        <header className="flex justify-between items-center gap-4 cursor-pointer max-w-full p-4 sm:p-6">
            <Link href="/" className="text-2xl sm:text-4xl font-semibold">SniffNotes</Link>
            <nav aria-label="Main" className="flex gap-4 sm:gap-6 lg:gap-7 items-center">

                {/* Below lg, only primary destinations show as icons; the menu has everything. */}
                {items.map(({ href, label, icon: Icon, primary }) => {
                    const badge = href === "/messages" && unread > 0;
                    return (
                        <NavLink
                            key={href}
                            href={href}
                            label={badge ? `${label} (${unread} unread)` : label}
                            className={`${navItem} ${primary ? "" : "hidden lg:block"}`}
                        >
                            <Icon aria-hidden className={icon}/>
                            {badge && (
                                <span aria-hidden className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[0.625rem] leading-4 font-bold text-center">
                                    {unread > 9 ? "9+" : unread}
                                </span>
                            )}
                        </NavLink>
                    );
                })}

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

                <NavMenu signedIn={Boolean(user)} unread={unread}/>
            </nav>
        </header>
    );
}
