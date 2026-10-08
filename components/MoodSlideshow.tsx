"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { useCanAnimate } from "@/components/useCanAnimate";

export type Slide = {
    image: string;
    mood: string;
    label: string;
};

type MoodSlideshowProps = {
    // In display order (chosen on the server: featured moods first).
    slides: Slide[];
};

const SHOW_MS = 7000;
const FADE_MS = 1800;

// One full-screen photo at a time: a slow zoom, then a crossfade to the next mood.
export default function MoodSlideshow({ slides }: MoodSlideshowProps) {
    const [index, setIndex] = useState(0);
    const [previous, setPrevious] = useState<number | null>(null);
    const [paused, setPaused] = useState(false);
    const canAnimate = useCanAnimate();

    useEffect(() => {
        if (!canAnimate || paused || slides.length < 2) return;
        const timer = window.setTimeout(() => {
            if (document.hidden) return;
            setPrevious(index);
            setIndex((index + 1) % slides.length);
        }, SHOW_MS);
        return () => window.clearTimeout(timer);
    }, [index, canAnimate, paused, slides.length]);

    const next = (index + 1) % slides.length;
    const current = slides[index];

    // The current and outgoing slides, plus the next one loading invisibly so the crossfade is smooth.
    const layers = [...new Set([previous, index, next].filter((i): i is number => i !== null))];

    return (
        <>
            <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
                {layers.map((i) => {
                    const role = i === index ? "current" : i === previous ? "previous" : "next";
                    return (
                        <Image
                            key={slides[i].image}
                            src={slides[i].image}
                            alt=""
                            fill
                            sizes="100vw"
                            priority={i === 0}
                            className={`object-cover transition-opacity ease-in-out ${role !== "next" && canAnimate ? "kenburns" : ""}`}
                            style={{
                                opacity: role === "current" ? 1 : 0,
                                transitionDuration: `${FADE_MS}ms`,
                                // Alternate the zoom's anchor so consecutive photos drift differently.
                                transformOrigin: i % 2 ? "30% 40%" : "70% 60%",
                                ["--kenburns-duration" as string]: `${SHOW_MS + FADE_MS}ms`,
                            }}
                        />
                    );
                })}
                <div className="theme-overlay absolute inset-0 bg-black/35 light:bg-white/30"/>
            </div>

            <Link
                href={`/search?mood=${current.mood}`}
                aria-label={`Now showing: ${current.label}. Search ${current.label} fragrances`}
                className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/40 bg-background/60 backdrop-blur-md text-sm hover:bg-background/80 transition-all duration-200"
            >
                {current.label} →
            </Link>

            {canAnimate && slides.length > 1 && (
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
