"use client";

import { useState, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { postForm } from "@/lib/api";

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPassword(null);
    setCopied(false);

    try {
      const formData = new FormData();
      formData.append("length", length.toString());
      formData.append("include_uppercase", includeUppercase.toString());
      formData.append("include_digits", includeDigits.toString());
      formData.append("include_symbols", includeSymbols.toString());

      const data = await postForm<{ password: string }>(
        "/api/tools/password-generate",
        formData,
      );
      setPassword(data.password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Password generation failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [length, includeUppercase, includeDigits, includeSymbols]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = password;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [password]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">🔐 Password Generator</h1>
        <p className="mt-2 text-neutral-400">
          Generate a cryptographically secure random password.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        {/* Length slider */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Length: {length} characters
          </label>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Checkbox options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500"
            />
            <span className="text-sm text-neutral-300">
              Include uppercase letters (A–Z)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(e) => setIncludeDigits(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500"
            />
            <span className="text-sm text-neutral-300">
              Include digits (0–9)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500"
            />
            <span className="text-sm text-neutral-300">
              Include symbols (!@#$%…)
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3
                     font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all
                     duration-300 hover:shadow-indigo-500/40 hover:scale-[1.01]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Generating…" : "Generate Password"}
        </button>

        {loading && <LoadingSpinner message="Generating password…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {password && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Your password
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 overflow-x-auto rounded-lg bg-black/40 px-4 py-3 font-mono text-sm text-emerald-400 select-all">
                {password}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium
                           text-white transition-all hover:bg-white/20 active:scale-95"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
