import { Bookmark, Calendar, MapPin, Settings, Sparkles, Store, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    // Only for signed-in visitors.
    signedIn?: boolean;
};

// Home, Search, News, and Messages sit directly in the header; everything else is grouped.

// Ways to find fragrances you don't know yet.
export const discoverItems: NavItem[] = [
    { href: "/for-you", label: "Picked for you", icon: Sparkles },
    { href: "/daily", label: "Fragrance of the day", icon: Calendar },
    { href: "/brands", label: "Brands", icon: Store },
    { href: "/guide", label: "NYC guide", icon: MapPin },
];

// Your own things (the account menu).
export const youItems: NavItem[] = [
    { href: "/collections", label: "Collections", icon: Bookmark },
    { href: "/friends", label: "Friends", icon: Users, signedIn: true },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}
