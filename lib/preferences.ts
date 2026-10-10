import { cache } from "react";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import { isMood, type Mood } from "@/utils/themeMap";

export const themeOptions = ["dark", "light", "system"] as const;
export const textSizeOptions = ["sm", "md", "lg", "xl"] as const;

export type Preferences = {
    theme: (typeof themeOptions)[number];
    textSize: (typeof textSizeOptions)[number];
    reduceMotion: boolean;
    highContrast: boolean;
    legibleFont: boolean;
    underlineLinks: boolean;
    favoriteMoods: Mood[];
};

export const defaultPreferences: Preferences = {
    theme: "dark",
    textSize: "md",
    reduceMotion: false,
    highContrast: false,
    legibleFont: false,
    underlineLinks: false,
    favoriteMoods: [],
};

export const PREFERENCES_COOKIE = "sniffnotes-prefs";
export const MAX_FAVORITE_MOODS = 3;

function pick<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
    return options.includes(value as T) ? (value as T) : fallback;
}

// Accepts anything (cookie JSON, a database row) and returns a valid Preferences object.
export function parsePreferences(value: unknown): Preferences {
    const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const moods = Array.isArray(raw.favoriteMoods) ? raw.favoriteMoods : [];

    return {
        theme: pick(themeOptions, raw.theme, defaultPreferences.theme),
        textSize: pick(textSizeOptions, raw.textSize, defaultPreferences.textSize),
        reduceMotion: raw.reduceMotion === true,
        highContrast: raw.highContrast === true,
        legibleFont: raw.legibleFont === true,
        underlineLinks: raw.underlineLinks === true,
        favoriteMoods: [...new Set(moods.filter((m): m is Mood => typeof m === "string" && isMood(m)))].slice(0, MAX_FAVORITE_MOODS),
    };
}

export const getPreferences = cache(async (): Promise<Preferences> => {
    const value = (await cookies()).get(PREFERENCES_COOKIE)?.value;
    if (!value) return defaultPreferences;

    try {
        return parsePreferences(JSON.parse(value));
    } catch {
        return defaultPreferences;
    }
});

// Only call from Server Actions or Route Handlers (Server Components can't set cookies).
export async function setPreferencesCookie(preferences: Preferences) {
    (await cookies()).set(PREFERENCES_COOKIE, JSON.stringify(preferences), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
}

// After sign-in: an account's saved preferences win; a new account adopts this device's preferences.
export async function syncPreferencesOnSignIn(supabase: SupabaseClient<Database>, userId: string) {
    const { data: profile } = await supabase.from("profiles").select("preferences").eq("id", userId).maybeSingle();
    const saved = profile?.preferences;

    if (saved && typeof saved === "object" && Object.keys(saved).length > 0) {
        await setPreferencesCookie(parsePreferences(saved));
    } else {
        await supabase.from("profiles").update({ preferences: preferencesToJson(await getPreferences()) }).eq("id", userId);
    }
}

export function preferencesToJson(preferences: Preferences) {
    return preferences as unknown as NonNullable<Json>;
}

// Data attributes on <html> that globals.css uses to apply each preference.
export { preferenceAttributes } from "@/lib/preference-attributes";
