import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
    title: "Account Deleted | SniffNotes",
};

export default function AccountDeletedPage() {
    return (
        <AuthCard title="Your account is deleted">
            <p className="mb-6 text-foreground/80">
                Your profile, collections, and daily picks have been permanently removed. Thanks for sniffing around with us.
            </p>
            <Link
                href="/"
                className="inline-block px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200"
            >
                Back to SniffNotes
            </Link>
        </AuthCard>
    );
}
