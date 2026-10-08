"use client";

import { useId } from "react";
import Link from "next/link";
import { ChevronDown, CircleUserRound, LogOut, Menu, X } from "lucide-react";
import MenuLinks, { menuItemClass, menuPanelClass } from "@/components/MenuLinks";
import { discoverItems, isActive, youItems } from "@/components/navItems";
import { useDisclosure } from "@/components/useDisclosure";
import { signOut } from "@/app/(auth)/actions";

const chevron = (open: boolean) => `size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`;

// "Discover ▾": ways to find fragrances you don't know yet.
export function DiscoverMenu() {
    const { open, toggle, containerRef, buttonRef, pathname } = useDisclosure();
    const panelId = useId();
    const here = discoverItems.some((item) => isActive(pathname, item.href));

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={toggle}
                className={`flex items-center gap-1 text-lg font-medium cursor-pointer underline-offset-8 decoration-2 hover:underline ${here ? "underline" : ""}`}
            >
                Discover
                <ChevronDown aria-hidden className={chevron(open)}/>
            </button>
            {open && (
                <nav id={panelId} aria-label="Discover" className={menuPanelClass}>
                    <MenuLinks items={discoverItems} signedIn/>
                </nav>
            )}
        </div>
    );
}

// The avatar menu: your collections, friends, settings, account, and signing out.
export function AccountMenu({ displayName }: { displayName: string }) {
    const { open, toggle, containerRef, buttonRef, pathname } = useDisclosure();
    const panelId = useId();
    const here = [...youItems.map((i) => i.href), "/account"].some((href) => isActive(pathname, href));

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`Account menu for ${displayName}`}
                onClick={toggle}
                className={`flex items-center gap-1 cursor-pointer rounded-full ${here ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-transparent" : ""}`}
            >
                <CircleUserRound aria-hidden className="size-6"/>
                <ChevronDown aria-hidden className={chevron(open)}/>
            </button>
            {open && (
                <div id={panelId} className={menuPanelClass}>
                    <p className="px-3 pt-2 pb-3 text-sm text-foreground/70 border-b border-foreground/15 mb-1">
                        Signed in as <span className="font-semibold text-foreground">{displayName}</span>
                    </p>
                    <nav aria-label="Your account">
                        <MenuLinks items={[...youItems, { href: "/account", label: "Account", icon: CircleUserRound }]} signedIn/>
                    </nav>
                    <form action={signOut} className="mt-1 pt-1 border-t border-foreground/15">
                        <button type="submit" className={`${menuItemClass} w-full cursor-pointer`}>
                            <LogOut aria-hidden className="size-5"/>
                            Sign out
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

// Small screens: one menu with everything, in Discover and You sections.
export function PhoneMenu({ signedIn, displayName }: { signedIn: boolean; displayName?: string }) {
    const { open, toggle, containerRef, buttonRef } = useDisclosure();
    const panelId = useId();
    const heading = "px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-foreground/60";

    return (
        <div ref={containerRef} className="relative">
            <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={panelId} aria-label="Menu" onClick={toggle} className="flex items-center cursor-pointer">
                {open ? <X aria-hidden className="size-6"/> : <Menu aria-hidden className="size-6"/>}
            </button>
            {open && (
                <nav id={panelId} aria-label="All pages" className={menuPanelClass}>
                    <p className={heading}>Discover</p>
                    <MenuLinks items={discoverItems} signedIn={signedIn}/>
                    <p className={`${heading} mt-2 border-t border-foreground/15 pt-3`}>{signedIn ? displayName ?? "You" : "You"}</p>
                    <MenuLinks
                        items={signedIn ? [...youItems, { href: "/account", label: "Account", icon: CircleUserRound }] : youItems}
                        signedIn={signedIn}
                    />
                    {signedIn ? (
                        <form action={signOut}>
                            <button type="submit" className={`${menuItemClass} w-full cursor-pointer`}>
                                <LogOut aria-hidden className="size-5"/>
                                Sign out
                            </button>
                        </form>
                    ) : (
                        <Link href="/sign-up" className={menuItemClass}>
                            <CircleUserRound aria-hidden className="size-5"/>
                            Create an account
                        </Link>
                    )}
                </nav>
            )}
        </div>
    );
}
