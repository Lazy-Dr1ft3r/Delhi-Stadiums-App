import type { Metadata, Viewport } from "next";
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
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
