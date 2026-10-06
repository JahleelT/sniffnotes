import type { Metadata } from "next";
import Link from "next/link";
import FriendActions from "@/components/FriendActions";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { findProfiles, getFriendLists, getRelationship, type PublicProfile, type Relationship } from "@/lib/friends";
import { defaultTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Friends | SniffNotes",
};

const card = `p-5 sm:p-6 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

function PersonList({ people, relationship, empty }: { people: PublicProfile[]; relationship: Relationship; empty: string }) {
    if (!people.length) return <p className="text-foreground/70">{empty}</p>;
    return (
        <ul className="flex flex-col gap-3">
            {people.map((person) => (
                <li key={person.id} className="flex flex-wrap items-center justify-between gap-3">
                    <PersonName person={person}/>
                    <FriendActions userId={person.id} name={person.displayName} relationship={relationship}/>
                </li>
            ))}
        </ul>
    );
}

function PersonName({ person }: { person: PublicProfile }) {
    const label = (
        <>
            <span className="font-semibold">{person.displayName}</span>
            {person.username && <span className="ml-2 text-foreground/70">@{person.username}</span>}
        </>
    );
    return person.username ? <Link href={`/people/${person.username}`} className="hover:underline underline-offset-4">{label}</Link> : <span>{label}</span>;
}

export default async function FriendsPage(props: PageProps<"/friends">) {
    const user = await requireUser("/friends");
    const { q } = await props.searchParams;
    const search = typeof q === "string" ? q.trim() : "";

    const [{ friends, incoming, outgoing }, results] = await Promise.all([getFriendLists(), findProfiles(search)]);
    const resultRelationships = await Promise.all(results.map((person) => getRelationship(person.id)));

    return (
        <PageShell>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <h1 className="text-3xl sm:text-4xl font-semibold">Friends</h1>

                {!user.username && (
                    <div className={card}>
                        <p>
                            Pick a username so friends can find you.{" "}
                            <Link href="/account" className="underline">Set it on your account page</Link>.
                        </p>
                    </div>
                )}

                <section className={card} aria-labelledby="find-heading">
                    <h2 id="find-heading" className="text-2xl font-semibold mb-4">Find people</h2>
                    <form role="search" action="/friends" method="get" className="flex gap-2 mb-4">
                        <label htmlFor="people-search" className="sr-only">Search by username or name</label>
                        <input
                            id="people-search"
                            name="q"
                            defaultValue={search}
                            minLength={2}
                            placeholder="Username or name"
                            className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-foreground/30 bg-background/40"
                        />
                        <button type="submit" className="px-5 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 cursor-pointer">
                            Search
                        </button>
                    </form>
                    {search && (
                        results.length ? (
                            <ul className="flex flex-col gap-3">
                                {results.map((person, i) => (
                                    <li key={person.id} className="flex flex-wrap items-center justify-between gap-3">
                                        <PersonName person={person}/>
                                        <FriendActions userId={person.id} name={person.displayName} relationship={resultRelationships[i]}/>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-foreground/70">No one matches “{search}”. People show up here once they&apos;ve picked a username.</p>
                        )
                    )}
                </section>

                {incoming.length > 0 && (
                    <section className={card} aria-labelledby="incoming-heading">
                        <h2 id="incoming-heading" className="text-2xl font-semibold mb-4">Friend requests</h2>
                        <PersonList people={incoming} relationship="incoming" empty=""/>
                    </section>
                )}

                <section className={card} aria-labelledby="friends-heading">
                    <h2 id="friends-heading" className="text-2xl font-semibold mb-4">Your friends</h2>
                    <PersonList people={friends} relationship="friends" empty="No friends yet. Find people above."/>
                </section>

                {outgoing.length > 0 && (
                    <section className={card} aria-labelledby="outgoing-heading">
                        <h2 id="outgoing-heading" className="text-2xl font-semibold mb-4">Sent requests</h2>
                        <PersonList people={outgoing} relationship="outgoing" empty=""/>
                    </section>
                )}
            </div>
        </PageShell>
    );
}
