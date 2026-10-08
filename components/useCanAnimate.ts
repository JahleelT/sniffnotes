"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
    return document.documentElement.dataset.motion === "reduce" || window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribe(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

// False on the server and for anyone who reduces motion (the SniffNotes setting or the device's).
export function useCanAnimate() {
    return !useSyncExternalStore(subscribe, prefersReducedMotion, () => true);
}
