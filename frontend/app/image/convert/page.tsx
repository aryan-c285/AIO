"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

const TARGET_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "bmp", label: "BMP" },
  { value: "gif", label: "GIF" },
];

export default function ConvertImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("png");
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
      formData.append("target_format", targetFormat);

      const blob = await uploadFile("/api/image/convert", formData);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Conversion failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file, targetFormat]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">🔄 Convert Image</h1>
        <p className="mt-2 text-neutral-400">
          Convert your image between PNG, JPEG, WebP, BMP, and GIF formats.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFileSelect}
          label="Drop your image here or click to browse"
        />

        {/* Format selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Target Format
          </label>
          <div className="flex flex-wrap gap-2">
            {TARGET_FORMATS.map((fmt) => (
              <button
                key={fmt.value}
                type="button"
                onClick={() => setTargetFormat(fmt.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                  ${
                    targetFormat === fmt.value
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {fmt.label}
              </button>
            ))}
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
          {loading ? "Converting…" : `Convert to ${targetFormat.toUpperCase()}`}
        </button>

        {loading && <LoadingSpinner message="Converting your image…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {resultUrl && (
          <DownloadButton
            blobUrl={resultUrl}
            filename={`converted.${targetFormat}`}
          />
        )}
      </div>
    </div>
  );
}
