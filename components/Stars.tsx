import { Star } from "lucide-react";

type StarsProps = {
    rating: number;
    className?: string;
};

// Read-only star display; partially filled stars round to the nearest half.
export default function Stars({ rating, className = "size-5" }: StarsProps) {
    const rounded = Math.round(rating * 2) / 2;

    return (
        <span role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`} className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((position) => {
                const fill = rounded >= position ? 1 : rounded >= position - 0.5 ? 0.5 : 0;
                return (
                    <span key={position} className="relative inline-block" aria-hidden>
                        <Star className={`${className} opacity-40`}/>
                        {fill > 0 && (
                            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                                <Star className={`${className} fill-current`}/>
                            </span>
                        )}
                    </span>
                );
            })}
        </span>
    );
}
