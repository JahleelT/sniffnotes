import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import AuthCard from "@/components/AuthCard";
import Field from "@/components/Field";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { signUp } from "../actions";

export const metadata: Metadata = {
    title: "Create Account | SniffNotes",
};

export default async function SignUpPage(props: PageProps<"/sign-up">) {
    const { next: nextParam } = await props.searchParams;
    const next = safeNext(nextParam);

    if (await getCurrentUser()) redirect(next);

    const signInHref = next === "/" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(next)}`;

    return (
        <AuthCard
            title="Create your account"
            footer={<p>Already have one? <Link href={signInHref} className="underline">Sign in</Link></p>}
        >
            <ActionForm action={signUp} submitLabel="Create account" pendingLabel="Creating account...">
                <input type="hidden" name="next" value={next}/>
                <Field label="Display name" name="displayName" autoComplete="nickname" maxLength={50} required/>
                <Field label="Email" name="email" type="email" autoComplete="email" required/>
                <Field
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    hint="At least 8 characters."
                    required
                />
            </ActionForm>
        </AuthCard>
    );
}
