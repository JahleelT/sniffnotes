import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import AuthCard from "@/components/AuthCard";
import Field from "@/components/Field";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { signIn } from "../actions";

export const metadata: Metadata = {
    title: "Sign In | SniffNotes",
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
    const { next: nextParam, error } = await props.searchParams;
    const next = safeNext(nextParam);

    if (await getCurrentUser()) redirect(next);

    const signUpHref = next === "/" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(next)}`;

    return (
        <AuthCard
            title="Welcome back"
            footer={
                <>
                    <Link href="/forgot-password" className="underline">Forgot your password?</Link>
                    <p>New here? <Link href={signUpHref} className="underline">Create an account</Link></p>
                </>
            }
        >
            {error === "link" && (
                <p role="alert" className="mb-4 text-danger">That link is invalid or has expired. Try again below.</p>
            )}

            <ActionForm action={signIn} submitLabel="Sign in" pendingLabel="Signing in...">
                <input type="hidden" name="next" value={next}/>
                <Field label="Email" name="email" type="email" autoComplete="email" required/>
                <Field label="Password" name="password" type="password" autoComplete="current-password" required/>
            </ActionForm>
        </AuthCard>
    );
}
