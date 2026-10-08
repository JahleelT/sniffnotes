import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Globe, MapPin, Navigation } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getBrandBySlug } from "@/lib/brands";
import { directionsUrl, getGuide, type GuideFilter, type Store } from "@/lib/guide";
import { STORE_TYPES, friendlyNeighborhood } from "@/lib/guide-areas";
import { defaultTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Manhattan Fragrance Guide | SniffNotes",
};

const FILTERS: { value: GuideFilter; label: string }[] = [
    { value: "all", label: "Everything" },
    { value: "boutique", label: STORE_TYPES.boutique.label },
    { value: "perfumery", label: STORE_TYPES.perfumery.label },
    { value: "shop", label: STORE_TYPES.shop.label },
    { value: "custom", label: STORE_TYPES.custom.label },
];

const card = `border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;
// Named groups, so each arrow follows its own dropdown rather than any open one around it.
const chevron = "size-5 shrink-0 transition-transform duration-200";

function StoreCard({ store }: { store: Store }) {
    const brands = store.carries.map(getBrandBySlug).filter((b) => b !== undefined);
    return (
        <li className="p-4 rounded-lg border border-foreground/15 bg-background/30">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-lg font-semibold">{store.name}</h4>
                <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-full border border-foreground/40">{STORE_TYPES[store.type].label}</span>
                    {store.customBlends && store.type !== "custom" && (
                        <span className="px-2 py-0.5 rounded-full border border-foreground/40">Custom blends</span>
                    )}
                    {!store.verified && (
                        <span className="px-2 py-0.5 rounded-full border border-dashed border-foreground/40 text-foreground/70" title="From OpenStreetMap, not yet checked by SniffNotes">
                            Unverified
                        </span>
                    )}
                </div>
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-foreground/80">
                <MapPin aria-hidden className="size-4 shrink-0"/>
                {store.address || "Address not listed"}
            </p>
            {store.note && <p className="mt-2 leading-relaxed">{store.note}</p>}

            {brands.length > 0 && (
                <p className="mt-2 text-sm">
                    Carries{" "}
                    {brands.map((brand, i) => (
                        <span key={brand.slug}>{i > 0 && ", "}<Link href={`/brands/${brand.slug}`} className="underline underline-offset-2">{brand.name}</Link></span>
                    ))}
                </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a href={directionsUrl(store)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/50 hover:bg-foreground/15">
                    <Navigation aria-hidden className="size-4"/> Directions
                </a>
                {store.website && (
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/50 hover:bg-foreground/15">
                        <Globe aria-hidden className="size-4"/> Website
                    </a>
                )}
            </div>
        </li>
    );
}

export default async function GuidePage(props: PageProps<"/guide">) {
    const { type } = await props.searchParams;
    const filter = FILTERS.some((f) => f.value === type) ? (type as GuideFilter) : "all";
    const { sections, total, counts } = getGuide(filter);
    // With a filter on, open everything so all matches are visible at once.
    const filtered = filter !== "all";

    return (
        <PageShell>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-semibold">Manhattan fragrance guide</h1>
                <p className="mt-2 text-foreground/80">
                    Where to smell and buy fragrance in Manhattan, from south to north. Open a part of town, then a neighborhood.
                </p>

                <nav aria-label="Store types" className="flex flex-wrap gap-2 my-6">
                    {FILTERS.map(({ value, label }) => {
                        const active = filter === value;
                        return (
                            <Link
                                key={value}
                                href={value === "all" ? "/guide" : `/guide?type=${value}`}
                                aria-current={active ? "page" : undefined}
                                className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${active ? "border-foreground bg-foreground/20" : "border-foreground/40 hover:bg-foreground/15"}`}
                            >
                                {label} ({counts[value]})
                            </Link>
                        );
                    })}
                </nav>

                {total === 0 && (
                    <p className={`p-5 ${card}`}>
                        {filter === "custom"
                            ? "No custom-blend shops listed yet. These are spots that mix a scent for you on the spot; they'll appear here as they're added."
                            : "No stores match this filter yet."}
                    </p>
                )}

                <div className="flex flex-col gap-4">
                    {sections.map((section, i) => (
                        <details key={section.name} open={filtered || i === 0} className={`group/section ${card}`}>
                            <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                <h2 className="text-2xl font-semibold">{section.name}</h2>
                                <span className="flex items-center gap-2 text-foreground/70">
                                    {section.count} {section.count === 1 ? "place" : "places"}
                                    <ChevronDown aria-hidden className={`${chevron} group-open/section:rotate-180`}/>
                                </span>
                            </summary>

                            <div className="flex flex-col gap-3 px-3 pb-4 sm:px-5">
                                {section.neighborhoods.map((neighborhood) => (
                                    <details key={neighborhood.name} open={filtered} className="group/hood rounded-lg border border-foreground/15">
                                        <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-foreground/5 rounded-lg">
                                            <h3 className="font-semibold">{friendlyNeighborhood(neighborhood.name)}</h3>
                                            <span className="flex items-center gap-2 text-sm text-foreground/70">
                                                {neighborhood.stores.length}
                                                <ChevronDown aria-hidden className={`${chevron} group-open/hood:rotate-180`}/>
                                            </span>
                                        </summary>
                                        <ul className="flex flex-col gap-3 p-3">
                                            {neighborhood.stores.map((store) => <StoreCard key={store.id} store={store}/>)}
                                        </ul>
                                    </details>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>

                <p className="mt-8 text-sm text-foreground/60">
                    Store listings start from <a href="https://www.openstreetmap.org/copyright" className="underline">© OpenStreetMap contributors</a>;
                    neighborhoods are NYC&apos;s official Neighborhood Tabulation Areas (NYC Open Data).
                    Stores marked unverified haven&apos;t been checked by SniffNotes yet. Hours and stock change, so check before you go.
                </p>
            </div>
        </PageShell>
    );
}
