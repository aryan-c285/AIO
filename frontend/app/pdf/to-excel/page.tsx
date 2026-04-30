"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DownloadButton from "@/components/DownloadButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { uploadFile } from "@/lib/api";

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
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

      const blob = await uploadFile("/api/pdf/to-excel", formData);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Conversion failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">📊 PDF to Excel</h1>
        <p className="mt-2 text-neutral-400">
          Extract tables and data from your PDF into an Excel (.xlsx)
          spreadsheet.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        <FileUpload
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          label="Drop your PDF here or click to browse"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3
                     font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all
                     duration-300 hover:shadow-indigo-500/40 hover:scale-[1.01]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Converting…" : "Convert to Excel"}
        </button>

        {loading && <LoadingSpinner message="Extracting data to Excel…" />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {resultUrl && (
          <DownloadButton blobUrl={resultUrl} filename="converted.xlsx" />
        )}
      </div>
    </div>
  );
}
