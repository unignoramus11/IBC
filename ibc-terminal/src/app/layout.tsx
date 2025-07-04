/**
 * layout.tsx
 * ----------
 * Root layout component for the IBC Terminal research platform.
 * Sets up global font, metadata, and analytics for all pages.
 * Ensures consistent appearance and research tracking across the app.
 */

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Termature",
  description:
    "An interactive terminal-based adventure game for research on functional fixedness",
  metadataBase: new URL("https://ibc-rouge.vercel.app/"),
  applicationName: "Termature",
  authors: [{ name: "IBC Research Team" }],
  keywords: [
    "terminal game",
    "research",
    "functional fixedness",
    "cognitive science",
    "problem-solving",
  ],
  creator: "IBC Research Team",
  publisher: "IBC Research",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://terminal-adventure.example.com",
    title: "Termature",
    description:
      "Interactive terminal-based adventure game for cognitive research",
    siteName: "Termature",
    images: [
      {
        url: "/android-icon-192x192.png",
        width: 192,
        height: 192,
        alt: "Termature Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Termature",
    description:
      "Interactive terminal-based adventure game for cognitive research",
    images: ["/android-icon-192x192.png"],
    creator: "@unignoramus11",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${geistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
