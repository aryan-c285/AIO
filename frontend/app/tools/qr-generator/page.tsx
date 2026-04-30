"use client";

import { useState, useCallback } from "react";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

export default function QrGeneratorPage() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(10);
  const [errorCorrection, setErrorCorrection] = useState("M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      setError("Please enter text or a URL to encode.");
      return;
    }
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setPreviewUrl(null);

    try {
      const formData = new FormData();
      formData.append("data", text.trim());
      formData.append("size", size.toString());
      formData.append("error_correction", errorCorrection);

      const blob = await uploadFile("/api/tools/qr-generate", formData);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setPreviewUrl(url);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "QR generation failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [text, size, errorCorrection]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">📱 QR Code Generator</h1>
        <p className="mt-2 text-neutral-400">
          Generate a QR code from any text or URL.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        {/* Text input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Text or URL
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter a URL or any text…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                       text-sm text-white placeholder-neutral-500 outline-none resize-none
                       transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Options row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-300">
              Box Size: {size}
            </label>
            <input
              type="range"
              min={4}
              max={20}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-300">
              Error Correction
            </label>
            <select
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5
                         text-sm text-white outline-none transition-colors
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="L" className="bg-neutral-900">Low (7%)</option>
              <option value="M" className="bg-neutral-900">Medium (15%)</option>
              <option value="Q" className="bg-neutral-900">Quartile (25%)</option>
              <option value="H" className="bg-neutral-900">High (30%)</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3
                     font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all
                     duration-300 hover:shadow-indigo-500/40 hover:scale-[1.01]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Generating…" : "Generate QR Code"}
        </button>

        {loading && <LoadingSpinner message="Generating QR code…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <img
              src={previewUrl}
              alt="Generated QR Code"
              className="rounded-lg bg-white p-2"
              style={{ maxWidth: 280 }}
            />
            <DownloadButton blobUrl={resultUrl!} filename="qrcode.png" />
          </div>
        )}
      </div>
    </div>
  );
}
