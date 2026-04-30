"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

export default function RemoveBgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(240);
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
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("threshold", threshold.toString());

      const blob = await uploadFile("/api/image/remove-bg", formData);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Background removal failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file, threshold]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">🎨 Remove Background</h1>
        <p className="mt-2 text-neutral-400">
          Automatically remove white or light-coloured backgrounds from your
          images.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFileSelect}
          label="Drop your image here or click to browse"
        />

        {/* Threshold slider */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Brightness Threshold: {threshold}
          </label>
          <input
            type="range"
            min={100}
            max={255}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>More aggressive</span>
            <span>Only pure white</span>
          </div>
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
          {loading ? "Processing…" : "Remove Background"}
        </button>

        {loading && <LoadingSpinner message="Removing background…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {resultUrl && (
          <DownloadButton blobUrl={resultUrl} filename="no-background.png" />
        )}
      </div>
    </div>
  );
}
