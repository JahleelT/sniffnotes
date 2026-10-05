type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    hint?: string;
};

export default function Field({ label, name, hint, ...inputProps }: FieldProps) {
    const hintId = hint ? `${name}-hint` : undefined;

    return (
        <label className="flex flex-col gap-1">
            <span className="font-medium">{label}</span>
            <input
                name={name}
                aria-describedby={hintId}
                className="px-4 py-3 rounded-lg border border-foreground/30 bg-background/40"
                {...inputProps}
            />
            {hint && <span id={hintId} className="text-sm text-foreground/70">{hint}</span>}
        </label>
    );
}
