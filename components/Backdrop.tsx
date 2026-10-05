import type { Theme } from "@/utils/themeMap";

type BackdropProps = {
    theme: Theme;
    children: React.ReactNode;
};

export default function Backdrop({ theme, children }: BackdropProps) {
    return (
        <div
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: `url('${theme.image}')`,
            }}
        >
            <div className={`theme-overlay min-h-screen ${theme.overlay}`}>
                {children}
            </div>
        </div>
    );
}
