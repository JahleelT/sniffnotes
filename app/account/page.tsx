import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import Field from "@/components/Field";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { defaultTheme } from "@/utils/themeMap";
import { signOut } from "@/app/(auth)/actions";
import { updateDisplayName } from "./actions";

export const metadata: Metadata = {
    title: "Account | SniffNotes",
};

const card = `p-8 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

export default async function AccountPage() {
    const user = await requireUser("/account");

    return (
        <PageShell>
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <h1 className="text-4xl font-semibold">Hi, {user.displayName}</h1>

                <section className={card} aria-labelledby="profile-heading">
                    <h2 id="profile-heading" className="text-2xl font-semibold mb-4">Profile</h2>
                    <p className="mb-4 text-foreground/80">Signed in as {user.email}</p>

                    <ActionForm action={updateDisplayName} submitLabel="Save display name" pendingLabel="Saving...">
                        <Field
                            label="Display name"
                            name="displayName"
                            defaultValue={user.displayName}
                            autoComplete="nickname"
                            maxLength={50}
                            required
                        />
                    </ActionForm>
                </section>

                <section className={card} aria-labelledby="security-heading">
                    <h2 id="security-heading" className="text-2xl font-semibold mb-4">Sign-in &amp; security</h2>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/account/update-password"
                            className="px-6 py-3 rounded-full border border-gray-300 hover:bg-white/20 transition-all duration-200"
                        >
                            Change password
                        </Link>

                        <form action={signOut}>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-full border border-gray-300 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
