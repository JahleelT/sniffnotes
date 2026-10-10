import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import PageShell from "@/components/PageShell";
import PreferencePreview from "@/components/PreferencePreview";
import { getCurrentUser } from "@/lib/auth";
import { getPreferences, MAX_FAVORITE_MOODS, type Preferences } from "@/lib/preferences";
import { defaultTheme, moods, themeMap } from "@/utils/themeMap";
import { savePreferences } from "./actions";

export const metadata: Metadata = {
    title: "Settings | SniffNotes",
};

const card = `p-6 sm:p-8 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;
const legend = "text-xl font-semibold mb-3";
const choice = "flex items-center gap-3 px-4 py-2 rounded-full border border-foreground/40 cursor-pointer has-[:checked]:bg-foreground/20 has-[:checked]:border-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--focus)]";

const themeLabels: Record<Preferences["theme"], string> = {
    dark: "Dark",
    light: "Light",
    system: "Match my device",
};

const textSizeLabels: Record<Preferences["textSize"], string> = {
    sm: "Small",
    md: "Default",
    lg: "Large",
    xl: "Extra large",
};

const toggles: { name: keyof Preferences; label: string; hint: string }[] = [
    { name: "reduceMotion", label: "Reduce motion", hint: "Turns off hover zooms and transitions." },
    { name: "highContrast", label: "High contrast", hint: "Solid cards, stronger borders, and pure text color." },
    { name: "legibleFont", label: "Easier-to-read font", hint: "Atkinson Hyperlegible, designed for low-vision readers." },
    { name: "underlineLinks", label: "Underline links", hint: "Makes links stand out from surrounding text." },
];

export default async function SettingsPage() {
    const [preferences, user] = await Promise.all([getPreferences(), getCurrentUser()]);

    return (
        <PageShell>
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <h1 className="text-4xl font-semibold">Settings</h1>
                <p className="text-foreground/80">
                    {user
                        ? "These settings are saved to your account and follow you to any device you sign in on."
                        : <>These settings are saved on this device. <Link href="/sign-in?next=/settings" className="underline">Sign in</Link> to keep them across devices.</>}
                </p>

                <div className={card}>
                    <PreferencePreview saved={preferences}>
                    <ActionForm action={savePreferences} submitLabel="Save settings" pendingLabel="Saving...">
                        <fieldset className="mb-4">
                            <legend className={legend}>Appearance</legend>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(themeLabels).map(([value, label]) => (
                                    <label key={value} className={choice}>
                                        <input type="radio" name="theme" value={value} defaultChecked={preferences.theme === value} className="accent-current"/>
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend className={legend}>Text size</legend>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(textSizeLabels).map(([value, label]) => (
                                    <label key={value} className={choice}>
                                        <input type="radio" name="textSize" value={value} defaultChecked={preferences.textSize === value} className="accent-current"/>
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend className={legend}>Accessibility</legend>
                            <div className="flex flex-col gap-3">
                                {toggles.map(({ name, label, hint }) => (
                                    <label key={name} className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name={name}
                                            defaultChecked={preferences[name] === true}
                                            aria-describedby={`${name}-hint`}
                                            className="mt-1.5 size-4 accent-current"
                                        />
                                        <span>
                                            <span className="font-medium">{label}</span>
                                            <span id={`${name}-hint`} className="block text-sm text-foreground/70">{hint}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="mb-2">
                            <legend className={legend}>Favorite moods</legend>
                            <p id="favorite-moods-hint" className="mb-3 text-sm text-foreground/70">
                                Pick up to {MAX_FAVORITE_MOODS}. They&apos;re shown first on the homepage.
                            </p>
                            <div className="flex flex-wrap gap-3" aria-describedby="favorite-moods-hint">
                                {moods.map((mood) => (
                                    <label key={mood} className={choice}>
                                        <input
                                            type="checkbox"
                                            name="favoriteMoods"
                                            value={mood}
                                            defaultChecked={preferences.favoriteMoods.includes(mood)}
                                            className="accent-current"
                                        />
                                        {themeMap[mood].label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </ActionForm>
                    </PreferencePreview>
                </div>
            </div>
        </PageShell>
    );
}
