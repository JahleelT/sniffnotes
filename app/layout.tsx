import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import TimezoneSync from "@/components/TimezoneSync";
import { TIMEZONE_COOKIE } from "@/lib/daily";
import { getPreferences, preferenceAttributes } from "@/lib/preferences";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Only downloaded when the "easier-to-read font" preference is on.
const legible = Atkinson_Hyperlegible({
  variable: "--font-legible",
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "SniffNotes",
  description: "Discover fragrances, notes, and scent experiences.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const preferences = await getPreferences();
  const timeZone = (await cookies()).get(TIMEZONE_COOKIE)?.value;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${legible.variable} h-full antialiased`}
      {...preferenceAttributes(preferences)}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-background focus:text-foreground"
        >
          Skip to content
        </a>
        {children}
        <TimezoneSync current={timeZone}/>
      </body>
    </html>
  );
}
