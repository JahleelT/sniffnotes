import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getBrandBySlug } from "@/lib/brands";
import { getFragranceById } from "@/lib/fragrances";
import type { NewsItem } from "@/lib/news";

type NewsListProps = {
    items: NewsItem[];
    cardClass: string;
    compact?: boolean;
};

function timeAgo(iso: string) {
    const hours = Math.round((Date.now() - Date.parse(iso)) / 3_600_000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const chip = "inline-flex px-3 py-1 rounded-full border border-foreground/40 text-sm hover:bg-foreground/15";

// Headlines and short excerpts that link out; full articles stay on the publisher's site.
export default function NewsList({ items, cardClass, compact = false }: NewsListProps) {
    return (
        <ul className="flex flex-col gap-4">
            {items.map((item) => {
                const brands = item.brandSlugs.map(getBrandBySlug).filter((b) => b !== undefined);
                const fragrances = item.fragranceIds.map(getFragranceById).filter((f) => f !== undefined);
                return (
                    <li key={item.id} className={`flex gap-4 p-4 sm:p-5 border rounded-xl backdrop-blur-sm ${cardClass}`}>
                        {item.imageUrl && !compact && (
                            // External publisher images: a plain <img>, so they don't go through (and count against) image optimization.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={item.imageUrl}
                                alt=""
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="hidden sm:block w-32 h-24 shrink-0 rounded-lg object-cover"
                            />
                        )}
                        <div className="min-w-0 flex flex-col gap-1.5">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="group font-semibold text-lg leading-snug hover:underline underline-offset-4">
                                {item.title}
                                <ExternalLink aria-label="(opens the publisher's site)" className="inline ml-1.5 size-4 opacity-60 group-hover:opacity-100"/>
                            </a>
                            <p className="text-sm text-foreground/70">{item.source} · {timeAgo(item.publishedAt)}</p>
                            {!compact && item.summary && <p className="leading-relaxed text-foreground/90">{item.summary}</p>}
                            {(brands.length > 0 || fragrances.length > 0) && (
                                <ul className="flex flex-wrap gap-2 mt-1" aria-label="Mentioned on SniffNotes">
                                    {brands.map((brand) => (
                                        <li key={brand.slug}><Link href={`/brands/${brand.slug}`} className={chip}>{brand.name}</Link></li>
                                    ))}
                                    {fragrances.map((fragrance) => (
                                        <li key={fragrance.id}><Link href={`/fragrance/${fragrance.id}`} className={chip}>{fragrance.name}</Link></li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
