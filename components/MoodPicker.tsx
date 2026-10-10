"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { saveFavoriteMoods } from "@/app/settings/actions";
import { useDisclosure } from "@/components/useDisclosure";
import type { FormState } from "@/lib/forms";
import { moods, themeMap, type Mood } from "@/utils/themeMap";

type MoodPickerProps = {
    selected: Mood[];
    max: number;
    label: string;
    className?: string;
};

const choice = "flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/40 text-sm cursor-pointer has-[:checked]:bg-foreground/20 has-[:checked]:border-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--focus)]";

// Favorite moods, picked in a small panel on the current page instead of a trip to Settings.
export default function MoodPicker({ selected, max, label, className = "" }: MoodPickerProps) {
    const { open, toggle, containerRef, buttonRef } = useDisclosure();
    const [state, formAction, pending] = useActionState<FormState, FormData>(saveFavoriteMoods, {});
    const panelId = useId();

    // Close once saved; the page re-renders with the new picks.
    useEffect(() => {
        if (state.message && open) toggle();
    }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={containerRef} className="relative inline-block">
            <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={panelId} onClick={toggle} className={className}>
                {label}
            </button>

            {open && (
                <form
                    id={panelId}
                    action={formAction}
                    onSubmit={(e) => {
                        // Submitting manually keeps the boxes ticked if the server returns an error.
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        startTransition(() => formAction(formData));
                    }}
                    aria-label="Favorite moods"
                    className="absolute left-0 top-full z-30 mt-2 w-[min(24rem,calc(100vw-2rem))] p-4 rounded-xl border border-foreground/20 bg-background/95 backdrop-blur-md shadow-xl"
                >
                    <p className="mb-3 text-sm text-foreground/80">Pick up to {max}. Picks and the home page lead with them.</p>
                    <fieldset className="flex flex-wrap gap-2">
                        <legend className="sr-only">Favorite moods</legend>
                        {moods.map((mood) => (
                            <label key={mood} className={choice}>
                                <input type="checkbox" name="favoriteMoods" value={mood} defaultChecked={selected.includes(mood)} className="accent-current"/>
                                {themeMap[mood].label}
                            </label>
                        ))}
                    </fieldset>
                    {state.error && <p role="alert" className="mt-3 text-sm text-danger">{state.error}</p>}
                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={pending}
                            className="px-5 py-2 rounded-full border border-foreground/60 font-semibold hover:bg-foreground/15 transition-all duration-200 cursor-pointer disabled:opacity-60"
                        >
                            {pending ? "Saving..." : "Save moods"}
                        </button>
                        <button type="button" onClick={toggle} className="px-3 py-2 underline underline-offset-4 cursor-pointer">Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
}
