import PageShell from "@/components/PageShell";
import { defaultTheme } from "@/utils/themeMap";

type AuthCardProps = {
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export default function AuthCard({ title, children, footer }: AuthCardProps) {
    return (
        <PageShell>
            <div className={`max-w-md mx-auto mt-10 p-8 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`}>
                <h1 className="text-3xl font-semibold mb-6">{title}</h1>
                {children}
                {footer && <div className="mt-6 flex flex-col gap-2 text-foreground/80">{footer}</div>}
            </div>
        </PageShell>
    );
}
