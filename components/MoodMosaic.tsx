"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

type MoodMosaicProps = {
    // Every photo that can appear, and the 12 shown first (chosen on the server).
    photos: string[];
    initial: string[];
};

// Each fade lasts 3s and a new one starts every 1–1.5s (randomized so they're staggered),
// so 2–3 tiles are mid-transition at any moment.
const FADE_MS = 3000;
const MIN_GAP_MS = 1000;
const MAX_GAP_MS = 1500;

// Tiles 1–3 show on phones (stacked), 1–9 on tablets (3×3), all 12 on desktop (4×3).
const tileVisibility = (index: number) => (index >= 9 ? "hidden lg:block" : index >= 3 ? "hidden md:block" : "block");

function visibleTileCount() {
    if (window.matchMedia("(min-width: 1024px)").matches) return 12;
    if (window.matchMedia("(min-width: 768px)").matches) return 9;
    return 3;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
    return document.documentElement.dataset.motion === "reduce" || window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeToMotionPreference(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

// One tile: loads the next photo in a hidden layer, then crossfades to it.
function Tile({ image, className }: { image: string; className: string }) {
    const [layers, setLayers] = useState<[string, string]>([image, image]);
    const [front, setFront] = useState<0 | 1>(0);
    const back = front === 0 ? 1 : 0;

    if (image !== layers[front] && image !== layers[back]) {
        setLayers(back === 0 ? [image, layers[1]] : [layers[0], image]);
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {layers.map((src, i) => (
                <Image
                    key={i}
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-opacity ease-in-out"
                    style={{ opacity: i === front ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
                    onLoad={() => {
                        if (i === back && src === image) setFront(back);
                    }}
                />
            ))}
        </div>
    );
}

export default function MoodMosaic({ photos, initial }: MoodMosaicProps) {
    const [tiles, setTiles] = useState(initial);
    const [paused, setPaused] = useState(false);
    // Tile index → when its current fade ends, so fading tiles aren't swapped again.
    const fadingUntil = useRef(new Map<number, number>());
    // Still on the server render; the browser's motion settings decide after hydration.
    const canAnimate = !useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => true);

    useEffect(() => {
        if (!canAnimate || paused) return;

        let timer: number;

        const swapOne = () => {
            const now = Date.now();
            const candidates = Array.from({ length: visibleTileCount() }, (_, i) => i)
                .filter((i) => (fadingUntil.current.get(i) ?? 0) <= now);

            if (!document.hidden && candidates.length) {
                const index = candidates[Math.floor(Math.random() * candidates.length)];
                const pick = Math.random();
                fadingUntil.current.set(index, now + FADE_MS);

                setTiles((current) => {
                    const unused = photos.filter((photo) => !current.includes(photo));
                    if (!unused.length) return current;
                    const next = [...current];
                    next[index] = unused[Math.floor(pick * unused.length)];
                    return next;
                });
            }

            timer = window.setTimeout(swapOne, MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS));
        };

        timer = window.setTimeout(swapOne, MIN_GAP_MS);
        return () => window.clearTimeout(timer);
    }, [canAnimate, paused, photos]);

    return (
        <>
            <div aria-hidden className="fixed inset-0 -z-10 grid grid-cols-1 grid-rows-3 md:grid-cols-3 lg:grid-cols-4 gap-1 bg-background">
                {tiles.map((image, index) => (
                    <Tile key={index} image={image} className={tileVisibility(index)}/>
                ))}
                <div className="theme-overlay absolute inset-0 bg-black/30 light:bg-white/25"/>
            </div>

            {canAnimate && (
                <button
                    type="button"
                    onClick={() => setPaused(!paused)}
                    aria-pressed={paused}
                    className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/40 bg-background/60 backdrop-blur-md text-sm hover:bg-background/80 transition-all duration-200 cursor-pointer"
                >
                    {paused ? <Play aria-hidden className="size-4"/> : <Pause aria-hidden className="size-4"/>}
                    {paused ? "Play background" : "Pause background"}
                </button>
            )}
        </>
    );
}
