"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/photos", label: "Projects" }, // Mapping Photos to Projects for style match, or keep as Photos
  { href: "/labs", label: "Labs" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

// Restore original items if preferred, but user wants "style in screenshot" which has specific items.
// I will stick to existing routes but maybe rename label for display in mobile?
// Actually, I should keep the existing routes functional.
// Existing: Home, Photos, Blog, About.
// Screenshot: Home, About, Projects, Blog, Contact.
// I will use the existing NAV_ITEMS for the desktop, and for mobile I'll display them.
// I'll add "Contact" as a dummy or mailto link if it doesn't exist.

const SITE_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/photos", label: "Photos" },
  { href: "/labs", label: "Labs" },
  { href: "/blog", label: "Blog" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Update time for the menu header
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      setCurrentTime(now.toLocaleString("en-GB", options));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog";
  const hideNav = isBlogPost || pathname === "/three-stations";

  if (hideNav) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {SITE_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-bold transition-colors ${
                  active
                    ? "text-[#0A0A0A] dark:text-white"
                    : "text-zinc-700 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
            aria-label="Open Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
          {/* Menu Header */}
          <div className="flex items-center justify-end px-6 py-4">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 shadow-sm dark:bg-zinc-800"
              aria-label="Close Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex flex-1 flex-col justify-center gap-6 px-6">
            {SITE_NAV_ITEMS.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-baseline justify-between border-b border-zinc-300 pb-2 dark:border-zinc-800"
              >
                <span className="text-4xl font-bold tracking-tight text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-400">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-zinc-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
            {/* Add Contact explicitly if not in list */}
             <Link
                href="mailto:hello@kanso.studio"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-baseline justify-between border-b border-zinc-300 pb-2 dark:border-zinc-800"
              >
                <span className="text-4xl font-bold tracking-tight text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-400">
                  Contact
                </span>
                <span className="text-sm font-medium text-zinc-400">
                  {String(SITE_NAV_ITEMS.length + 1).padStart(2, "0")}
                </span>
              </Link>
          </div>
        </div>
      )}
    </>
  );
}
