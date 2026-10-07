import { Bookmark, Calendar, Search, Settings, Sparkles, Store, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    // Shown as an icon on every screen size; the rest go in the menu below the lg breakpoint.
    primary?: boolean;
    // Only for signed-in visitors.
    signedIn?: boolean;
};

export const navItems: NavItem[] = [
    { href: "/search", label: "Search", icon: Search, primary: true },
    { href: "/daily", label: "Fragrance of the day", icon: Calendar },
    { href: "/for-you", label: "Picked for you", icon: Sparkles },
    { href: "/brands", label: "Brands", icon: Store },
    { href: "/friends", label: "Friends", icon: Users },
    { href: "/collections", label: "Collections", icon: Bookmark },
    { href: "/settings", label: "Settings", icon: Settings },
];
