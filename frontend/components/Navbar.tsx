"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";

const NAV_LINKS = [
  { label: "PDF Tools", href: "/pdf" },
  { label: "Image Tools", href: "/image" },
  { label: "Converters", href: "/convert/word-to-pdf" },
  { label: "Dev Tools", href: "/tools/qr-generator" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80
                 backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg
                        bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold
                        text-white shadow-lg shadow-indigo-500/25 transition-shadow
                        group-hover:shadow-indigo-500/40"
          >
            AIO
          </div>
          <span className="text-lg font-semibold text-white">
            Tool<span className="text-indigo-400">kit</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-300"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleMobile}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400
                     transition-colors hover:bg-white/5 hover:text-white md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 px-4 pb-4 md:hidden">
          <ul className="mt-2 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
