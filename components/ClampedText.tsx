"use client";

import { useEffect, useRef, useState } from "react";

// Long text shows its first part with a "Read more" button, so one long description doesn't
// stretch the cards beside it. Short text shows in full with no button.
export default function ClampedText({ children, maxHeight = "26rem" }: { children: React.ReactNode; maxHeight?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [overflowing, setOverflowing] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const measure = () => setOverflowing(element.scrollHeight > element.clientHeight + 1);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const clamped = !expanded;

    return (
        <div>
            <div
                ref={ref}
                className={`relative overflow-hidden ${clamped && overflowing ? "[mask-image:linear-gradient(to_bottom,black_75%,transparent)]" : ""}`}
                style={{ maxHeight: clamped ? maxHeight : undefined }}
            >
                {children}
            </div>
            {(overflowing || expanded) && (
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    className="px-2 mt-1 font-medium underline underline-offset-4 cursor-pointer"
                >
                    {expanded ? "Show less" : "Read more"}
                </button>
            )}
        </div>
    );
}
