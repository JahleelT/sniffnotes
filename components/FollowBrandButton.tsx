import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { setBrandFollowed } from "@/app/brands/actions";

type FollowBrandButtonProps = {
    slug: string;
    name: string;
    following: boolean;
    signedIn: boolean;
};

const button = "inline-flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-200 cursor-pointer";

export default function FollowBrandButton({ slug, name, following, signedIn }: FollowBrandButtonProps) {
    if (!signedIn) {
        return (
            <Link href={`/sign-in?next=/brands/${slug}`} className={`${button} border-foreground/60 hover:bg-foreground/15`}>
                <Plus aria-hidden className="size-4"/> Follow
            </Link>
        );
    }

    return (
        <form action={setBrandFollowed}>
            <input type="hidden" name="brand" value={slug}/>
            <input type="hidden" name="follow" value={following ? "false" : "true"}/>
            <button
                type="submit"
                aria-pressed={following}
                aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
                className={`${button} ${following ? "border-foreground bg-foreground/20" : "border-foreground/60 hover:bg-foreground/15"}`}
            >
                {following ? <Check aria-hidden className="size-4"/> : <Plus aria-hidden className="size-4"/>}
                {following ? "Following" : "Follow"}
            </button>
        </form>
    );
}
