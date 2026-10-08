"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, type NavItem } from "@/components/navItems";

export const menuItemClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-foreground/10";
export const menuPanelClass = "absolute right-0 top-full mt-3 w-64 p-2 rounded-xl border border-foreground/20 bg-background/95 backdrop-blur-md shadow-xl";

// A list of menu links with icons, marking the current page.
export default function MenuLinks({ items, signedIn }: { items: NavItem[]; signedIn: boolean }) {
    const pathname = usePathname();
    return (
        <ul>
            {items.filter((item) => signedIn || !item.signedIn).map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                    <li key={href}>
                        <Link href={href} aria-current={active ? "page" : undefined} className={`${menuItemClass} ${active ? "bg-foreground/15 font-semibold" : ""}`}>
                            <Icon aria-hidden className="size-5"/>
                            {label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
