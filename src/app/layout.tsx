import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3, Geist_Mono, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import "@/styles/masonry.css";
import ThemeProviders from "@/components/theme/ThemeProviders";
import HeaderNav from "@/components/theme/HeaderNav";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
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

export const metadata: Metadata = {
  title: "Playful Photos & Interactive Blogs",
  description: "Photo stories and interactive explainers about vibrant cities and complex ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} ${inter.variable} ${newsreader.variable} antialiased`}
      >
        <ThemeProviders>
          <HeaderNav />
          <main>{children}</main>
          <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="px-5 py-12">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F4CA16]" />
                © {new Date().getFullYear()} My Site
              </div>
            </div>
          </footer>
        </ThemeProviders>
      </body>
    </html>
  );
}
