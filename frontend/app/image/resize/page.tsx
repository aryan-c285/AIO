"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

export default function ResizeImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
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
    if (width < 1 || height < 1) {
      setError("Width and height must be positive numbers.");
      return;
    }
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("width", width.toString());
      formData.append("height", height.toString());

      const blob = await uploadFile("/api/image/resize", formData);
      const ext = file.name.split(".").pop() ?? "png";
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Resize failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file, width, height]);

  const ext = file?.name.split(".").pop() ?? "png";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">↔️ Resize Image</h1>
        <p className="mt-2 text-neutral-400">
          Change your image dimensions to any custom width and height.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFileSelect}
          label="Drop your image here or click to browse"
        />

        {/* Dimension inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-300">
              Width (px)
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                         text-sm text-white outline-none transition-colors
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-300">
              Height (px)
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                         text-sm text-white outline-none transition-colors
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
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
          {loading ? "Resizing…" : "Resize Image"}
        </button>

        {loading && <LoadingSpinner message="Resizing your image…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {resultUrl && (
          <DownloadButton blobUrl={resultUrl} filename={`resized.${ext}`} />
        )}
      </div>
    </div>
  );
}
