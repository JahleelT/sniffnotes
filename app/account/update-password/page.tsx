import type { Metadata } from "next";
import ActionForm from "@/components/ActionForm";
import AuthCard from "@/components/AuthCard";
import Field from "@/components/Field";
import { requireUser } from "@/lib/auth";
import { updatePassword } from "@/app/(auth)/actions";

export const metadata: Metadata = {
    title: "Update Password | SniffNotes",
};

export default async function UpdatePasswordPage() {
    await requireUser("/account/update-password");

    return (
        <AuthCard title="Choose a new password">
            <ActionForm action={updatePassword} submitLabel="Update password" pendingLabel="Updating...">
                <Field
                    label="New password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    hint="At least 8 characters."
                    required
                />
                <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required/>
            </ActionForm>
        </AuthCard>
    );
}
