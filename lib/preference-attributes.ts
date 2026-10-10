import type { Preferences } from "@/lib/preferences";

// The <html> data attributes that apply preferences (styled in globals.css). Kept apart from
// lib/preferences.ts, which is server-only, so the settings page can preview changes in the browser.
export function preferenceAttributes(preferences: Preferences) {
    return {
        "data-theme": preferences.theme,
        "data-text-size": preferences.textSize,
        "data-motion": preferences.reduceMotion ? "reduce" : undefined,
        "data-contrast": preferences.highContrast ? "more" : undefined,
        "data-font": preferences.legibleFont ? "legible" : undefined,
        "data-links": preferences.underlineLinks ? "underline" : undefined,
    };
}
