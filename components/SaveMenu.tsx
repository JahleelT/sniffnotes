"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import { createCollection, setFragranceSaved } from "@/app/collections/actions";
import type { Theme } from "@/utils/themeMap";

type SaveMenuProps = {
    fragranceId: string;
    fragranceName: string;
    collections: { id: string; name: string; saved: boolean }[];
    theme: Theme;
};

const pill = "inline-flex items-center gap-2 px-6 py-3 rounded-full border border-foreground/60 backdrop-blur-sm hover:bg-foreground/15 transition-all duration-200 cursor-pointer";

export default function SaveMenu({ fragranceId, fragranceName, collections, theme }: SaveMenuProps) {
    const [open, setOpen] = useState(false);
    // Optimistic choices layered over the server's answer until the page re-renders.
    const [overrides, setOverrides] = useState<Record<string, boolean>>({});
    const [failed, setFailed] = useState(false);
    const [, startTransition] = useTransition();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelId = useId();

    const isSaved = (c: SaveMenuProps["collections"][number]) => overrides[c.id] ?? c.saved;
    const savedCount = collections.filter(isSaved).length;

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: PointerEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
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

    const toggle = (collectionId: string, saved: boolean) => {
        setFailed(false);
        setOverrides((current) => ({ ...current, [collectionId]: saved }));
        startTransition(async () => {
            const result = await setFragranceSaved(collectionId, fragranceId, saved);
            if (!result.ok) {
                setOverrides((current) => ({ ...current, [collectionId]: !saved }));
                setFailed(true);
            }
        });
    };

    return (
        <div ref={menuRef} className="relative inline-block text-left">
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
                className={`${pill} ${savedCount ? "bg-foreground/20" : ""}`}
            >
                {savedCount ? <BookmarkCheck aria-hidden size={20}/> : <Bookmark aria-hidden size={20}/>}
                {savedCount ? `Saved in ${savedCount}` : "Save"}
            </button>

            {open && (
                <div
                    id={panelId}
                    role="group"
                    aria-label={`Save ${fragranceName} to collections`}
                    className={`absolute left-1/2 -translate-x-1/2 z-40 mt-3 w-80 p-5 border rounded-xl backdrop-blur-md shadow-xl text-left ${theme.card} ${theme.border}`}
                >
                    <p className="font-semibold mb-3">Save to…</p>

                    <ul className="flex flex-col gap-2 mb-4">
                        {collections.map((collection) => (
                            <li key={collection.id}>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSaved(collection)}
                                        onChange={(e) => toggle(collection.id, e.target.checked)}
                                        className="size-4 accent-current"
                                    />
                                    {collection.name}
                                </label>
                            </li>
                        ))}
                    </ul>

                    {failed && <p role="alert" className="mb-3 text-danger">That didn&apos;t save. Try again.</p>}

                    <ActionForm
                        action={createCollection}
                        submitLabel="Create & save"
                        pendingLabel="Creating..."
                        resetOnSuccess
                        className="flex flex-col gap-2 pt-4 border-t border-foreground/20"
                    >
                        <input type="hidden" name="fragranceId" value={fragranceId}/>
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">New collection</span>
                            <input
                                name="name"
                                maxLength={40}
                                required
                                placeholder="e.g. Date night"
                                className="px-3 py-2 rounded-lg border border-foreground/30 bg-background/40"
                            />
                        </label>
                    </ActionForm>
                </div>
            )}
        </div>
    );
}
