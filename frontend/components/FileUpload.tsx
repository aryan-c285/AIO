"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

interface FileUploadProps {
  /** MIME-type accept string, e.g. "application/pdf" or "image/*" */
  accept: string;
  /** Callback when file(s) are selected */
  onFileSelect: (files: File[]) => void;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes (default 10 MB) */
  maxSize?: number;
  /** Label shown in the drop zone */
  label?: string;
}

const MAX_SIZE_DEFAULT = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUpload({
  accept,
  onFileSelect,
  multiple = false,
  maxSize = MAX_SIZE_DEFAULT,
  label = "Drag & drop your file here, or click to browse",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);

      const arr = Array.from(files);
      const oversized = arr.find((f) => f.size > maxSize);
      if (oversized) {
        setError(
          `"${oversized.name}" exceeds the ${formatBytes(maxSize)} limit.`,
        );
        return;
      }

      setSelectedFiles(arr);
      onFileSelect(arr);
    },
    [maxSize, onFileSelect],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    (index: number) => {
      const next = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(next);
      onFileSelect(next);
      if (inputRef.current) inputRef.current.value = "";
    },
    [selectedFiles, onFileSelect],
  );

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center
                    gap-3 rounded-2xl border-2 border-dashed p-6 transition-all duration-300
                    ${
                      dragOver
                        ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                        : "border-white/15 bg-white/[0.03] hover:border-indigo-500/50 hover:bg-white/[0.05]"
                    }`}
      >
        {/* Upload icon */}
        <div
          className={`rounded-xl p-3 transition-colors duration-300 ${
            dragOver ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-neutral-400 group-hover:text-indigo-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16V3m0 0L7 8m5-5l5 5M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2"
            />
          </svg>
        </div>

        <p className="text-sm text-neutral-400 text-center">{label}</p>
        <p className="text-xs text-neutral-500">
          Max file size: {formatBytes(maxSize)}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      {/* Selected file list */}
      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {selectedFiles.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2 text-sm"
            >
              <span className="truncate text-neutral-300">
                {file.name}{" "}
                <span className="text-neutral-500">
                  ({formatBytes(file.size)})
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-3 text-neutral-500 transition-colors hover:text-red-400"
                aria-label={`Remove ${file.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
