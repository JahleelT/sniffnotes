"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Open/close state for header menus: closes on an outside click, on Escape (returning focus to the
// button), and after navigating to another page.
export function useDisclosure() {
    const [open, setOpen] = useState(false);
    const [openedOn, setOpenedOn] = useState<string | null>(null);
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    if (open && openedOn !== pathname) setOpen(false);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const toggle = () => {
        setOpenedOn(pathname);
        setOpen(!open);
    };

    return { open, toggle, containerRef, buttonRef, pathname };
}
