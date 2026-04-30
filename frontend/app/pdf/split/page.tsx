"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("1-3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setResultUrl(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    if (!pages.trim()) {
      setError("Please specify page ranges.");
      return;
    }
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages.trim());

      const blob = await uploadFile("/api/pdf/split", formData);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Split failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file, pages]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">✂️ Split PDF</h1>
        <p className="mt-2 text-neutral-400">
          Extract specific pages from your PDF into a new document.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        <FileUpload
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          label="Drop your PDF here or click to browse"
        />

        {/* Page range input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Page Ranges
          </label>
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder="e.g. 1-3, 5, 7-9"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                       text-sm text-white placeholder-neutral-500 outline-none
                       transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Comma-separated ranges. Example: 1-3, 5, 7-9
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3
                     font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all
                     duration-300 hover:shadow-indigo-500/40 hover:scale-[1.01]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Splitting…" : "Split PDF"}
        </button>

        {loading && <LoadingSpinner message="Splitting your PDF…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {resultUrl && (
          <DownloadButton blobUrl={resultUrl} filename="split.pdf" />
        )}
      </div>
    </div>
  );
}
