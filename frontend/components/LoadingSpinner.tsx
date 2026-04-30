"use client";

interface LoadingSpinnerProps {
  /** Optional message shown below the spinner */
  message?: string;
}

export default function LoadingSpinner({
  message = "Processing…",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      {/* Animated ring spinner */}
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-500" />
      </div>
      {message && (
        <p className="text-sm text-neutral-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}
