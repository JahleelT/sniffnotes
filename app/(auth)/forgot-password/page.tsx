import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import AuthCard from "@/components/AuthCard";
import Field from "@/components/Field";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = {
    title: "Reset Password | SniffNotes",
};

export default async function ForgotPasswordPage(props: PageProps<"/forgot-password">) {
    const { error } = await props.searchParams;
    return (
        <AuthCard
            title="Reset your password"
            footer={<Link href="/sign-in" className="underline">Back to sign in</Link>}
        >
            {error === "browser" && (
                <p role="alert" className="mb-4 text-danger">
                    That reset link was opened in a different browser than the one you requested it from. Request a new one below, then open the email on this device.
                </p>
            )}
            <p className="mb-4 text-foreground/80">Enter your email and we&apos;ll send you a link to choose a new password.</p>

            <ActionForm action={requestPasswordReset} submitLabel="Send reset link" pendingLabel="Sending...">
                <Field label="Email" name="email" type="email" autoComplete="email" required/>
            </ActionForm>
        </AuthCard>
    );
}
