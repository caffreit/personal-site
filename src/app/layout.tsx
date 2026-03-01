import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import "@/styles/masonry.css";
import ThemeProviders from "@/components/theme/ThemeProviders";
import HeaderNav from "@/components/theme/HeaderNav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Portraits, Pattrens, Opinions",
  description: "Photo stories and interactive explainers about vibrant cities and complex ideas.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/me.jpg",
        width: 1200,
        height: 630,
        alt: "Portraits, Patterns, Opinions — Photo stories and interactive explainers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${mono.variable} ${inter.variable} ${newsreader.variable} antialiased`}
      >
        <ThemeProviders>
          <HeaderNav />
          <main>{children}</main>
          <footer className="border-t border-[var(--rule-color)] px-6 py-8 lg:px-10">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between font-[family-name:var(--font-display)] text-[0.75rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
              <span>&copy; {new Date().getFullYear()} drdimg</span>
              <span>Photography &amp; Data — Dublin, Ireland</span>
            </div>
          </footer>
        </ThemeProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
