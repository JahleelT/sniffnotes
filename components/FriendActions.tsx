import { addFriend, removeFriend } from "@/app/friends/actions";
import type { Relationship } from "@/lib/friends";

const button = "px-4 py-2 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 cursor-pointer text-sm";

type FriendActionsProps = {
    userId: string;
    name: string;
    relationship: Relationship;
};

// The buttons that fit where you stand with someone.
export default function FriendActions({ userId, name, relationship }: FriendActionsProps) {
    if (relationship === "self") return null;

    const form = (action: (formData: FormData) => Promise<void>, label: string, aria: string, extra = "") => (
        <form action={action}>
            <input type="hidden" name="userId" value={userId}/>
            <button type="submit" aria-label={aria} className={`${button} ${extra}`}>{label}</button>
        </form>
    );

    return (
        <div className="flex flex-wrap gap-2">
            {relationship === "none" && form(addFriend, "Add friend", `Send a friend request to ${name}`)}
            {relationship === "incoming" && (
                <>
                    {form(addFriend, "Accept", `Accept ${name}'s friend request`, "font-semibold")}
                    {form(removeFriend, "Decline", `Decline ${name}'s friend request`)}
                </>
            )}
            {relationship === "outgoing" && form(removeFriend, "Cancel request", `Cancel your friend request to ${name}`)}
            {relationship === "friends" && form(removeFriend, "Unfriend", `Remove ${name} from your friends`)}
        </div>
    );
}
