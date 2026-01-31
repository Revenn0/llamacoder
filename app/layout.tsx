import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import "./globals.css";

let title = "Aura.app – AI Code Generator";
let description = "Build anything with AI - full-stack apps, games, websites";
let url = "https://aura.app/";
let ogimage = "https://aura.app/og-image.png";
let sitename = "aura.app";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-black">
      <head>
        <PlausibleProvider domain="aura.app" />
      </head>

      {children}
    </html>
  );
}
