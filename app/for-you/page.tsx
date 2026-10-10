import type { Metadata } from "next";
import Link from "next/link";
import MoodPicker from "@/components/MoodPicker";
import PageShell from "@/components/PageShell";
import RecommendationGrid from "@/components/RecommendationGrid";
import { getCurrentUser } from "@/lib/auth";
import { MAX_FAVORITE_MOODS } from "@/lib/preferences";
import { getPersonalRecommendations } from "@/lib/recommendations";
import { defaultTheme, themeMap } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "For You | SniffNotes",
};

const card = `p-6 sm:p-8 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

export default async function ForYouPage() {
    const [user, { picks, savedCount, favoriteMoods }] = await Promise.all([
        getCurrentUser(),
        getPersonalRecommendations(12),
    ]);

    const basis = [
        savedCount ? `${savedCount} saved ${savedCount === 1 ? "fragrance" : "fragrances"}` : "",
        favoriteMoods.length ? `your favorite moods (${favoriteMoods.map((m) => themeMap[m].label).join(", ")})` : "",
    ].filter(Boolean);

    return (
        <PageShell>
            <h1 className="text-3xl sm:text-4xl font-semibold">Picked for you</h1>
            {basis.length > 0 && (
                <div className="mt-2 mb-8 text-foreground/80">
                    Based on {basis.join(" and ")}.{" "}
                    <MoodPicker
                        selected={favoriteMoods}
                        max={MAX_FAVORITE_MOODS}
                        label={favoriteMoods.length ? "Change moods" : "Add favorite moods"}
                        className="underline underline-offset-4 cursor-pointer hover:text-foreground"
                    />
                </div>
            )}

            {picks.length > 0 ? (
                <RecommendationGrid recommendations={picks}/>
            ) : (
                <div className={`max-w-2xl ${card}`}>
                    <h2 className="text-2xl font-semibold mb-3">Help us learn your nose</h2>
                    <p className="text-foreground/80 mb-5">
                        {savedCount
                            ? "You've saved everything we'd recommend so far. Check back as more fragrances are added."
                            : "Recommendations come from the fragrances you save and the moods you love."}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {!user && (
                            <Link href="/sign-in?next=/for-you" className="px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200">
                                Sign in to save fragrances
                            </Link>
                        )}
                        <MoodPicker
                            selected={favoriteMoods}
                            max={MAX_FAVORITE_MOODS}
                            label="Pick favorite moods"
                            className="px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 cursor-pointer"
                        />
                        <Link href="/search" className="px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200">
                            Browse fragrances
                        </Link>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
