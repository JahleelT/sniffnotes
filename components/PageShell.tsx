import Backdrop from "@/components/Backdrop";
import Header from "@/components/Header";
import { defaultTheme, type Theme } from "@/utils/themeMap";

type PageShellProps = {
    theme?: Theme;
    children: React.ReactNode;
};

// Background, header bar, and main landmark shared by the inner pages.
export default function PageShell({ theme = defaultTheme, children }: PageShellProps) {
    return (
        <Backdrop theme={theme}>
            <div className={`sticky top-0 z-40 backdrop-blur-sm border-b ${theme.card} ${theme.border}`}>
                <Header/>
            </div>

            <main id="main" className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
                {children}
            </main>
        </Backdrop>
    );
}
