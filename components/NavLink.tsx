"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    href: string;
    label: string;
    className?: string;
    children: React.ReactNode;
};

// Header link that marks itself as the current page (keeps its underline and sets aria-current).
export default function NavLink({ href, label, className = "", children }: NavLinkProps) {
    const pathname = usePathname();
    const active = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`${className} ${active ? "after:w-full" : ""}`}
        >
            {children}
        </Link>
    );
}
