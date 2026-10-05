"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/app/(auth)/actions";

type ActionFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    submitLabel: string;
    pendingLabel: string;
    children: React.ReactNode;
};

export default function ActionForm({ action, submitLabel, pendingLabel, children }: ActionFormProps) {
    const [state, formAction, pending] = useActionState(action, {});

    return (
        <form
            action={formAction}
            onSubmit={(e) => {
                // Submitting manually keeps the inputs filled in when the server returns an error.
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startTransition(() => formAction(formData));
            }}
            className="flex flex-col gap-4"
        >
            {children}

            {state.error && <p role="alert" className="text-red-300">{state.error}</p>}
            {state.message && <p role="status" className="text-emerald-300">{state.message}</p>}

            <button
                type="submit"
                disabled={pending}
                className="mt-2 px-6 py-3 rounded-full border border-gray-300 font-semibold hover:bg-white/20 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
                {pending ? pendingLabel : submitLabel}
            </button>
        </form>
    );
}
