"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

export default function CompressImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(70);
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
      formData.append("quality", quality.toString());

      const blob = await uploadFile("/api/image/compress", formData);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Compression failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file, quality]);

  const ext = file?.name.split(".").pop() ?? "png";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">📦 Compress Image</h1>
        <p className="mt-2 text-neutral-400">
          Reduce your image file size while maintaining visual quality.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFileSelect}
          label="Drop your image here or click to browse"
        />

        {/* Quality slider */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>Smaller file</span>
            <span>Higher quality</span>
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
          {loading ? "Compressing…" : "Compress Image"}
        </button>

        {loading && <LoadingSpinner message="Compressing your image…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {resultUrl && (
          <DownloadButton blobUrl={resultUrl} filename={`compressed.${ext}`} />
        )}
      </div>
    </div>
  );
}
