// Shared by the server (to render the saved mode) and the toggle (to save it). Kept out of the
// client component, because a server component importing a value from a "use client" file gets a
// client reference, not the value.
export type HomeBackgroundMode = "single" | "grid";
export const HOME_BACKGROUND_COOKIE = "sniffnotes-home-bg";
