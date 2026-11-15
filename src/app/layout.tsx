import type { Metadata } from "next";
import "./globals.css";
import "../components/menu/MainMenu.css";

export const metadata: Metadata = {
  title: { default: "ELYSIUM IV | Interactive Mars Exploration", template: "%s | ELYSIUM IV" },
  description: "Explore ELYSIUM IV, a browser-based 3D Mars rover expedition across three Sols.",
  icons: { icon: "/assets/images/elysium_iv_official_logo_4k_transparent.png", apple: "/assets/images/elysium_iv_official_logo_4k_transparent.png" },
  manifest: "/site.webmanifest",
  openGraph: { type: "website", siteName: "ELYSIUM IV", images: [{ url: "/assets/images/elysium_iv_official_logo_4k_transparent.png", width: 1200, height: 630, alt: "ELYSIUM IV - Interactive 3D Mars Exploration" }] },
  twitter: { card: "summary_large_image", images: ["/assets/images/elysium_iv_official_logo_4k_transparent.png"] }
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="m-0 min-h-screen bg-[#05090d] font-sans [color-scheme:dark]">{children}</body></html>;
}
