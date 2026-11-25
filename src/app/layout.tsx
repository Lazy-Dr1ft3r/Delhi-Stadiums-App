import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "../styles/globals.css";

// "Delhi Tracks" is a placeholder name (brief §10.3 — decide later).
export const metadata: Metadata = {
  title: { default: "Delhi Tracks", template: "%s · Delhi Tracks" },
  description: "Running tracks in Delhi — location, surface, access, hours and verified status.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-xl items-center px-4 py-3">
            <Link href="/" className="text-lg font-bold text-teal-800 dark:text-teal-300">
              Delhi Tracks
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
