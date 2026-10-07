import { NextResponse, type NextRequest } from "next/server";
import { runNewsRefresh } from "@/lib/news";

// Fetching five feeds takes a few seconds; allow up to a minute on hosts that cap function time.
export const maxDuration = 60;

// For a scheduler (vercel.json's cron, or any cron service). Requires `Authorization: Bearer $CRON_SECRET`,
// which Vercel Cron sends automatically when CRON_SECRET is set.
export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await runNewsRefresh(true);
    return NextResponse.json({ status });
}
