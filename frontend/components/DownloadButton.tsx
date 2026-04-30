"use client";

import { useCallback } from "react";

interface DownloadButtonProps {
  /** Object URL created from the response blob */
  blobUrl: string;
  /** Suggested filename for the download */
  filename: string;
}

export default function DownloadButton({
  blobUrl,
  filename,
}: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [blobUrl, filename]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="group relative mt-4 inline-flex items-center gap-2 overflow-hidden rounded-xl
                 bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 font-semibold
                 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300
                 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.98]"
    >
      {/* Shine animation overlay */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r
                   from-transparent via-white/20 to-transparent transition-transform
                   duration-700 group-hover:translate-x-full"
      />

      {/* Download icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
        />
      </svg>
      Download {filename}
    </button>
  );
}
