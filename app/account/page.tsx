import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import Field from "@/components/Field";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { defaultTheme } from "@/utils/themeMap";
import { signOut } from "@/app/(auth)/actions";
import { deleteAccount, updateDisplayName } from "./actions";

export const metadata: Metadata = {
    title: "Account | SniffNotes",
};

const card = `p-6 sm:p-8 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

export default async function AccountPage() {
    const user = await requireUser("/account");

    return (
        <PageShell>
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <h1 className="text-3xl sm:text-4xl font-semibold">Hi, {user.displayName}</h1>

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
                            href="/settings"
                            className="px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200"
                        >
                            Display &amp; accessibility settings
                        </Link>

                        <Link
                            href="/account/update-password"
                            className="px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200"
                        >
                            Change password
                        </Link>

                        <form action={signOut}>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 cursor-pointer"
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </section>

                <section className={card} aria-labelledby="delete-heading">
                    <h2 id="delete-heading" className="text-2xl font-semibold mb-2">Delete account</h2>
                    <p className="mb-4 text-foreground/80">
                        Permanently deletes your account, collections, and daily picks. This can&apos;t be undone.
                    </p>

                    <details>
                        <summary className="cursor-pointer text-danger">I want to delete my account</summary>

                        <div className="mt-4">
                            <ActionForm action={deleteAccount} submitLabel="Delete my account permanently" pendingLabel="Deleting...">
                                <Field label="Confirm your password" name="password" type="password" autoComplete="current-password" required/>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" name="confirm" required className="mt-1.5 size-4 accent-current"/>
                                    <span>I understand my collections and daily picks will be deleted forever.</span>
                                </label>
                            </ActionForm>
                        </div>
                    </details>
                </section>
            </div>
        </PageShell>
    );
}
