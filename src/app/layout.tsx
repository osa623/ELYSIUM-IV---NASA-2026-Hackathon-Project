import type { Metadata } from "next";
import { siteUrl } from "./site";
import "./globals.css";
import "./public.css";
import "../components/menu/MainMenu.css";
export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: { default: "ELYSIUM IV | Interactive Mars Exploration", template: "%s | ELYSIUM IV" },
  description: "Explore ELYSIUM IV, a browser-based 3D Mars rover exploration experience across Martian terrains and scientific investigations.",
  icons: {
    icon: [
      { url: "/assets/images/elysium_iv_official_logo_4k_transparent.png", sizes: "any" },
    ],
    shortcut: "/assets/images/elysium_iv_official_logo_4k_transparent.png",
    apple: [{ url: "/assets/images/elysium_iv_official_logo_4k_transparent.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "ELYSIUM IV",
    ...(siteUrl ? { images: [{ url: "/assets/images/elysium_iv_official_logo_4k_transparent.png", width: 1200, height: 630, alt: "ELYSIUM IV — Interactive 3D Mars Exploration" }] } : {}),
  },
  twitter: { card: siteUrl ? "summary_large_image" : "summary", ...(siteUrl ? { images: ["/assets/images/elysium_iv_official_logo_4k_transparent.png"] } : {}) },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  other: {
    "msapplication-TileColor": "#05090d",
    "msapplication-TileImage": "/mstile-150x150.png",
    "msapplication-config": "/browserconfig.xml",
  },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className="m-0 min-h-screen bg-[#05090d] font-sans [color-scheme:dark]">{children}</body></html>; }
