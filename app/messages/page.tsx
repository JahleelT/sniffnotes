import type { Metadata } from "next";
import Link from "next/link";
import LiveMessages from "@/components/LiveMessages";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { getConversations, type Conversation } from "@/lib/messages";
import { defaultTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Messages | SniffNotes",
};

const card = `border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;
const tab = "px-5 py-2 rounded-full border transition-all duration-200";

function when(iso: string) {
    const date = new Date(iso);
    return Date.now() - date.getTime() < 86_400_000
        ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ConversationList({ conversations, me }: { conversations: Conversation[]; me: string }) {
    return (
        <ul className={`divide-y divide-foreground/10 ${card}`}>
            {conversations.map(({ other, lastMessage, unread, status }) => (
                <li key={other.id}>
                    <Link
                        href={`/messages/${other.username}`}
                        className="card-link flex items-center justify-between gap-4 p-4 hover:bg-foreground/5"
                    >
                        <div className="min-w-0">
                            <p className={unread ? "font-semibold" : "font-medium"}>
                                {other.displayName} <span className="font-normal text-foreground/60">@{other.username}</span>
                                {status === "request-sent" && <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-foreground/40">Request sent</span>}
                            </p>
                            <p className={`truncate ${unread ? "text-foreground" : "text-foreground/70"}`}>
                                {lastMessage.senderId === me ? "You: " : ""}{lastMessage.body}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm text-foreground/60">{when(lastMessage.createdAt)}</span>
                            {unread > 0 && (
                                <span className="min-w-6 px-2 py-0.5 rounded-full bg-foreground text-background text-xs font-semibold text-center" aria-label={`${unread} unread`}>
                                    {unread}
                                </span>
                            )}
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default async function MessagesPage(props: PageProps<"/messages">) {
    const user = await requireUser("/messages");
    const { view } = await props.searchParams;
    const showRequests = view === "requests";
    const { inbox, requests } = await getConversations();
    const list = showRequests ? requests : inbox;

    return (
        <PageShell>
            <LiveMessages userId={user.id}/>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-semibold">Messages</h1>

                <nav aria-label="Message folders" className="flex gap-2 my-6">
                    <Link href="/messages" aria-current={!showRequests ? "page" : undefined} className={`${tab} ${!showRequests ? "border-foreground bg-foreground/20" : "border-foreground/40 hover:bg-foreground/15"}`}>
                        Inbox
                    </Link>
                    <Link href="/messages?view=requests" aria-current={showRequests ? "page" : undefined} className={`${tab} ${showRequests ? "border-foreground bg-foreground/20" : "border-foreground/40 hover:bg-foreground/15"}`}>
                        Requests{requests.length > 0 && ` (${requests.length})`}
                    </Link>
                </nav>

                {showRequests && (
                    <p className="mb-4 text-foreground/80">Messages from people who aren&apos;t your friends. Open one to accept or decline it; replying also accepts.</p>
                )}

                {list.length > 0 ? (
                    <ConversationList conversations={list} me={user.id}/>
                ) : (
                    <p className="text-foreground/80">
                        {showRequests
                            ? "No message requests."
                            : <>No conversations yet. Message a friend from their <Link href="/friends" className="underline">profile</Link>.</>}
                    </p>
                )}
            </div>
        </PageShell>
    );
}
