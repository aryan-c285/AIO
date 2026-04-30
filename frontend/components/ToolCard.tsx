"use client";

import Link from "next/link";

interface ToolCardProps {
  /** Card title */
  title: string;
  /** Short description */
  description: string;
  /** Emoji or text icon */
  icon: string;
  /** Navigation target */
  href: string;
}

export default function ToolCard({
  title,
  description,
  icon,
  href,
}: ToolCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]
                    p-6 backdrop-blur-sm transition-all duration-300
                    hover:border-indigo-500/40 hover:bg-white/[0.06] hover:shadow-xl
                    hover:shadow-indigo-500/10 hover:-translate-y-1"
      >
        {/* Glow effect on hover */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full
                      bg-indigo-500/20 blur-3xl transition-opacity duration-500
                      opacity-0 group-hover:opacity-100"
        />

        {/* Icon */}
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl
                      bg-gradient-to-br from-indigo-500/20 to-purple-500/20
                      text-2xl transition-transform duration-300 group-hover:scale-110"
        >
          {icon}
        </div>

        {/* Title */}
        <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-indigo-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-neutral-400">{description}</p>

        {/* Arrow */}
        <div
          className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400
                      opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"
        >
          Explore
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
