"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navItems } from "@/components/navItems";

type NavMenuProps = {
    signedIn: boolean;
};

// Labeled menu with every destination, for screens too narrow to show them all as icons.
export default function NavMenu({ signedIn }: NavMenuProps) {
    const [open, setOpen] = useState(false);
    const [openedOn, setOpenedOn] = useState<string | null>(null);
    const pathname = usePathname();
    const panelId = useId();
    const ref = useRef<HTMLDivElement>(null);

    // Close after navigating somewhere.
    if (open && openedOn !== pathname) setOpen(false);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative lg:hidden">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label="Menu"
                onClick={() => {
                    setOpenedOn(pathname);
                    setOpen(!open);
                }}
                className="flex items-center cursor-pointer"
            >
                {open ? <X aria-hidden className="size-6"/> : <Menu aria-hidden className="size-6"/>}
            </button>

            {open && (
                <nav
                    id={panelId}
                    aria-label="All pages"
                    className="absolute right-0 top-full mt-4 w-64 p-2 rounded-xl border border-foreground/20 bg-background/95 backdrop-blur-md shadow-xl"
                >
                    <ul>
                        {navItems.filter((item) => signedIn || !item.signedIn).map(({ href, label, icon: Icon }) => {
                            const active = pathname === href || pathname.startsWith(`${href}/`);
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={active ? "page" : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-foreground/10 ${active ? "bg-foreground/15 font-semibold" : ""}`}
                                    >
                                        <Icon aria-hidden className="size-5"/>
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            )}
        </div>
    );
}
