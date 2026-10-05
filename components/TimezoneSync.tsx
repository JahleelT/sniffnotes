"use client";

import { useEffect } from "react";

// Stores the browser's time zone in a cookie so the server knows the visitor's local date.
export default function TimezoneSync({ current }: { current?: string }) {
    useEffect(() => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone && timeZone !== current) {
            // IANA zone names only use cookie-safe characters, so no encoding is needed.
            document.cookie = `sniffnotes-tz=${timeZone}; path=/; max-age=31536000; samesite=lax`;
        }
    }, [current]);

    return null;
}
