"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
    document.addEventListener("focusin", onChange);
    document.addEventListener("focusout", onChange);
    return () => {
        document.removeEventListener("focusin", onChange);
        document.removeEventListener("focusout", onChange);
    };
}

function searchHasFocus() {
    return Boolean(document.activeElement?.closest('form[role="search"]'));
}

// True while someone is in a search form (typing or about to), so moving backgrounds can hold still.
export function useSearchFocused() {
    return useSyncExternalStore(subscribe, searchHasFocus, () => false);
}
