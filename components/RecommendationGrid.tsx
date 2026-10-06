import FragranceCard from "@/components/FragranceCard";
import { describeRecommendation } from "@/lib/recommendations";
import type { Recommendation } from "@/lib/recommend";

type RecommendationGridProps = {
    recommendations: Recommendation[];
    compact?: boolean;
};

export default function RecommendationGrid({ recommendations, compact = false }: RecommendationGridProps) {
    return (
        <ul className={`grid gap-4 sm:gap-6 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]"}`}>
            {recommendations.map((recommendation) => (
                <li key={recommendation.fragrance.id}>
                    <FragranceCard
                        fragrance={recommendation.fragrance}
                        reason={describeRecommendation(recommendation)}
                        compact={compact}
                    />
                </li>
            ))}
        </ul>
    );
}
