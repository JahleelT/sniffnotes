"use client";

import { useEffect, useRef, useState } from "react";
import { preferenceAttributes } from "@/lib/preference-attributes";
import type { Preferences } from "@/lib/preferences";

type PreferencePreviewProps = {
    saved: Preferences;
    children: React.ReactNode;
};

function apply(preferences: Preferences) {
    const html = document.documentElement;
    for (const [name, value] of Object.entries(preferenceAttributes(preferences))) {
        if (value === undefined) html.removeAttribute(name);
        else html.setAttribute(name, value);
    }
}

// The appearance settings in a form, as Preferences (favorite moods don't change how pages look).
function read(form: HTMLFormElement, saved: Preferences): Preferences {
    const data = new FormData(form);
    const theme = data.get("theme");
    const textSize = data.get("textSize");
    return {
        ...saved,
        theme: (theme as Preferences["theme"]) ?? saved.theme,
        textSize: (textSize as Preferences["textSize"]) ?? saved.textSize,
        reduceMotion: data.get("reduceMotion") === "on",
        highContrast: data.get("highContrast") === "on",
        legibleFont: data.get("legibleFont") === "on",
        underlineLinks: data.get("underlineLinks") === "on",
    };
}

const appearanceKeys = ["theme", "textSize", "reduceMotion", "highContrast", "legibleFont", "underlineLinks"] as const;

// Shows appearance changes on the page as soon as they're picked. Leaving without saving puts the
// saved settings back.
export default function PreferencePreview({ saved, children }: PreferencePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const savedRef = useRef(saved);
    const [unsaved, setUnsaved] = useState(false);

    const form = () => containerRef.current?.querySelector("form") ?? null;

    const update = () => {
        const current = form();
        if (!current) return;
        const preview = read(current, savedRef.current);
        apply(preview);
        setUnsaved(appearanceKeys.some((key) => preview[key] !== savedRef.current[key]));
    };

    // After a save, the server sends back the new settings.
    useEffect(() => {
        savedRef.current = saved;
        update();
    }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => apply(savedRef.current), []);

    const undo = () => {
        form()?.reset();
        apply(savedRef.current);
        setUnsaved(false);
    };

    return (
        <div ref={containerRef} onChange={update}>
            <p role="status" className={`mb-4 flex flex-wrap items-center gap-3 text-sm ${unsaved ? "" : "sr-only"}`}>
                {unsaved && (
                    <>
                        <span>Previewing your changes. Save to keep them.</span>
                        <button type="button" onClick={undo} className="underline underline-offset-4 cursor-pointer">
                            Undo changes
                        </button>
                    </>
                )}
            </p>
            {children}
        </div>
    );
}
