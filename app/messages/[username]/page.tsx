import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import LiveMessages from "@/components/LiveMessages";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/friends";
import { getThread, markThreadRead, PENDING_MESSAGE_LIMIT } from "@/lib/messages";
import { defaultTheme } from "@/utils/themeMap";
import { respondToRequest, sendMessage } from "../actions";

export async function generateMetadata(props: PageProps<"/messages/[username]">): Promise<Metadata> {
    const { username } = await props.params;
    return { title: `Messages with @${username} | SniffNotes` };
}

const card = `border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;
const pill = "px-5 py-2 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 cursor-pointer";

export default async function ConversationPage(props: PageProps<"/messages/[username]">) {
    const { username } = await props.params;
    const user = await requireUser(`/messages/${username}`);
    const other = await getProfileByUsername(username);
    if (!other || other.id === user.id) notFound();

    await markThreadRead(other.id);
    const thread = (await getThread(other.id))!;
    const remaining = PENDING_MESSAGE_LIMIT - thread.sentWhilePending;
    const canSend = thread.status === "open"
        || thread.status === "request-received"
        || thread.status === "declined-by-you"
        || (thread.status === "request-sent" && remaining > 0);

    return (
        <PageShell>
            <LiveMessages userId={user.id}/>
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
                <Link href={thread.status === "request-received" ? "/messages?view=requests" : "/messages"} className="underline text-foreground/80">← Messages</Link>

                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold">{other.displayName}</h1>
                    <Link href={`/people/${other.username}`} className="text-foreground/70 hover:underline underline-offset-4">
                        @{other.username}{thread.isFriend && " · Friend"}
                    </Link>
                </div>

                {thread.status === "request-received" && (
                    <div className={`p-4 flex flex-wrap items-center justify-between gap-3 ${card}`} role="status">
                        <p>{other.displayName} isn&apos;t your friend yet and wants to message you.</p>
                        <div className="flex gap-2">
                            {[true, false].map((accept) => (
                                <form key={String(accept)} action={respondToRequest}>
                                    <input type="hidden" name="senderId" value={other.id}/>
                                    <input type="hidden" name="accept" value={String(accept)}/>
                                    <button type="submit" className={`${pill} ${accept ? "font-semibold" : ""}`}>{accept ? "Accept" : "Decline"}</button>
                                </form>
                            ))}
                        </div>
                    </div>
                )}
                {thread.status === "request-sent" && (
                    <p className={`p-4 ${card}`} role="status">
                        Message request sent. {remaining > 0
                            ? `You can send ${remaining} more ${remaining === 1 ? "message" : "messages"} until ${other.displayName} accepts.`
                            : `You've reached the limit until ${other.displayName} accepts.`}
                    </p>
                )}
                {thread.status === "declined-by-them" && (
                    <p className={`p-4 ${card}`} role="status">{other.displayName} isn&apos;t accepting messages from you.</p>
                )}
                {thread.status === "declined-by-you" && (
                    <div className={`p-4 flex flex-wrap items-center justify-between gap-3 ${card}`} role="status">
                        <p>You declined {other.displayName}&apos;s message request.</p>
                        <form action={respondToRequest}>
                            <input type="hidden" name="senderId" value={other.id}/>
                            <input type="hidden" name="accept" value="true"/>
                            <button type="submit" className={pill}>Accept instead</button>
                        </form>
                    </div>
                )}

                {/* Reversed column so the newest messages sit at the bottom and are in view by default. */}
                <ol className={`flex flex-col-reverse gap-2 p-4 min-h-48 max-h-[60vh] overflow-y-auto ${card}`} aria-label="Messages">
                    {[...thread.messages].reverse().map((message) => {
                        const mine = message.senderId === user.id;
                        return (
                            <li key={message.id} className={`max-w-[80%] ${mine ? "self-end text-right" : "self-start"}`}>
                                <p className={`inline-block px-4 py-2 rounded-2xl whitespace-pre-line text-left ${mine ? "bg-foreground/20" : "bg-foreground/10 border border-foreground/15"}`}>
                                    <span className="sr-only">{mine ? "You" : other.displayName}: </span>
                                    {message.body}
                                </p>
                                <p className="text-xs text-foreground/60 mt-0.5">
                                    {new Date(message.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                    {mine && message.readAt && " · Seen"}
                                </p>
                            </li>
                        );
                    })}
                    {thread.messages.length === 0 && <li className="m-auto text-foreground/70">Say hello to {other.displayName}.</li>}
                </ol>

                {canSend && (
                    <ActionForm action={sendMessage} submitLabel="Send" pendingLabel="Sending..." resetOnSuccess className="flex flex-col gap-2">
                        <input type="hidden" name="recipientId" value={other.id}/>
                        <label className="flex flex-col gap-1">
                            <span className="sr-only">Message to {other.displayName}</span>
                            <textarea
                                name="body"
                                rows={3}
                                maxLength={2000}
                                required
                                placeholder={thread.status === "request-received" ? "Reply (this accepts their request)" : "Write a message"}
                                className="px-4 py-3 rounded-lg border border-foreground/30 bg-background/40"
                            />
                        </label>
                    </ActionForm>
                )}
            </div>
        </PageShell>
    );
}
