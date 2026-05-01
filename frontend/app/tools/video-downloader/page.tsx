"use client";

import { useState, useCallback, useMemo } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { postJSON, downloadStream } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface VideoFormat {
  format_id: string;
  label: string;
  filesize: string;
  filesize_bytes: number | null;
  type: "video" | "audio";
  ext: string;
  height: number;
  abr: number;
  has_audio?: boolean;
}

interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: string;
  formats: VideoFormat[];
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadDone, setDownloadDone] = useState(false);

  /* ---------- Filtered formats based on toggle ---------- */
  const filteredFormats = useMemo(() => {
    if (!info) return [];
    if (mode === "video") {
      const combinedVideo = info.formats.filter(
        (f) => f.type === "video" && f.has_audio,
      );
      return combinedVideo.length > 0 ? combinedVideo : info.formats.filter((f) => f.type === "video");
    }
    return info.formats.filter((f) => f.type === mode);
  }, [info, mode]);

  /* ---------- Step 1: Fetch Info ---------- */
  const handleFetch = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }
    setFetchLoading(true);
    setError(null);
    setInfo(null);
    setSelectedFormat("");
    setDownloadDone(false);

    try {
      const data = await postJSON<VideoInfo>("/api/video/info", {
        url: url.trim(),
      });
      setInfo(data);
      // Auto-select a combined video+audio option when available, otherwise fallback.
      const firstCombinedVideo = data.formats.find(
        (f) => f.type === "video" && f.has_audio,
      );
      const firstVideo = data.formats.find((f) => f.type === "video");
      const firstAudio = data.formats.find((f) => f.type === "audio");
      if (firstCombinedVideo) {
        setSelectedFormat(firstCombinedVideo.format_id);
        setMode("video");
      } else if (firstVideo) {
        setSelectedFormat(firstVideo.format_id);
        setMode("video");
      } else if (firstAudio) {
        setSelectedFormat(firstAudio.format_id);
        setMode("audio");
      }
    } catch (err: unknown) {
      const serverMsg = (err as any)?.response?.data?.detail;
      const msg =
        typeof serverMsg === "string"
          ? serverMsg
          : err instanceof Error
          ? err.message
          : "Failed to fetch video info. Check the URL and try again.";
      setError(msg);
    } finally {
      setFetchLoading(false);
    }
  }, [url]);

  /* ---------- Step 2: Download ---------- */
  const handleDownload = useCallback(async () => {
    if (!selectedFormat) {
      setError("Please select a quality format.");
      return;
    }
    setDownloadLoading(true);
    setError(null);
    setDownloadDone(false);

    try {
      await downloadStream(
        "/api/video/download",
        { url: url.trim(), format_id: selectedFormat },
        `${info?.title ?? "video"}.mp4`,
      );
      setDownloadDone(true);
    } catch (err: unknown) {
      const serverMsg = (err as any)?.response?.data?.detail;
      const msg =
        typeof serverMsg === "string"
          ? serverMsg
          : err instanceof Error
          ? err.message
          : "Download failed. Please try again.";
      setError(msg);
    } finally {
      setDownloadLoading(false);
    }
  }, [url, selectedFormat, info]);

  /* ---------- Mode toggle handler ---------- */
  const handleModeSwitch = useCallback(
    (newMode: "video" | "audio") => {
      setMode(newMode);
      setSelectedFormat("");
      setDownloadDone(false);
      if (info) {
        const first = info.formats.find(
          (f) => f.type === newMode && (newMode === "audio" || f.has_audio),
        );
        if (first) {
          setSelectedFormat(first.format_id);
        }
      }
    },
    [info],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">🎬 Video Downloader</h1>
        <p className="mt-2 text-neutral-400">
          Download videos and audio from YouTube, Instagram, Twitter/X and
          1000+ sites. Paste a URL to get started.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        {/* -------- Disclaimer -------- */}
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-500/20
                      bg-amber-500/5 px-4 py-3"
        >
          <span className="mt-0.5 text-lg">⚠️</span>
          <p className="text-sm leading-relaxed text-amber-300/90">
            <strong>For personal use only.</strong> Respect copyright and the
            terms of service of the platform you are downloading from. We do not
            store any files.
          </p>
        </div>

        {/* -------- URL Input -------- */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Video URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                         text-sm text-white placeholder-neutral-500 outline-none
                         transition-colors focus:border-indigo-500 focus:ring-1
                         focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={!url.trim() || fetchLoading}
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                         px-5 py-2.5 text-sm font-semibold text-white shadow-lg
                         shadow-indigo-500/25 transition-all duration-300
                         hover:shadow-indigo-500/40 hover:scale-[1.02]
                         disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:hover:scale-100"
            >
              {fetchLoading ? "Fetching…" : "Fetch Info"}
            </button>
          </div>
        </div>

        {/* -------- Loading (fetch) -------- */}
        {fetchLoading && (
          <LoadingSpinner message="Extracting video information…" />
        )}

        {/* -------- Error -------- */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* -------- Video Info Card -------- */}
        {info && (
          <div
            className="overflow-hidden rounded-2xl border border-white/10
                        bg-white/[0.03] backdrop-blur-sm animate-fade-in-up"
          >
            {/* Thumbnail + meta */}
            <div className="flex flex-col sm:flex-row">
              {info.thumbnail && (
                <div className="relative sm:w-56 shrink-0 overflow-hidden">
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="h-full w-full object-cover"
                  />
                  {/* Duration badge */}
                  <span
                    className="absolute bottom-2 right-2 rounded bg-black/70
                               px-2 py-0.5 text-xs font-medium text-white"
                  >
                    {info.duration}
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col justify-center p-5">
                <h2 className="text-lg font-semibold leading-snug text-white">
                  {info.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Duration: {info.duration} • {info.formats.length} formats
                  available
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-white/5 p-5 space-y-5">
              {/* Video / Audio toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-300">
                  Mode:
                </span>
                <div className="flex rounded-lg border border-white/10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("video")}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      mode === "video"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🎥 Video
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("audio")}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      mode === "audio"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🎵 Audio Only
                  </button>
                </div>
              </div>

              {/* Quality picker */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  Quality
                </label>
                {filteredFormats.length > 0 ? (
                  <select
                    value={selectedFormat}
                    onChange={(e) => {
                      setSelectedFormat(e.target.value);
                      setDownloadDone(false);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-white/5
                               px-4 py-2.5 text-sm text-white outline-none
                               transition-colors focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500"
                  >
                    {filteredFormats.map((f) => {
                      const label =
                        mode === "video" && f.type === "video" && !f.has_audio
                          ? `${f.label.replace(/ ?\(video only\)/i, "")} (Video + Audio)`
                          : f.label;
                      return (
                        <option
                          key={f.format_id}
                          value={f.format_id}
                          className="bg-neutral-900"
                        >
                          {label} — {f.filesize}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No {mode} formats available for this video.
                  </p>
                )}
              </div>

              {/* Download button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!selectedFormat || downloadLoading}
                className="group relative w-full overflow-hidden rounded-xl
                           bg-gradient-to-r from-emerald-600 to-teal-500
                           px-6 py-3 font-semibold text-white shadow-lg
                           shadow-emerald-500/25 transition-all duration-300
                           hover:shadow-emerald-500/40 hover:scale-[1.01]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           disabled:hover:scale-100"
              >
                {/* Shine */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full
                             bg-gradient-to-r from-transparent via-white/20
                             to-transparent transition-transform duration-700
                             group-hover:translate-x-full"
                />
                <span className="relative flex items-center justify-center gap-2">
                  {downloadLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          className="opacity-75"
                        />
                      </svg>
                      Downloading…
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
                        />
                      </svg>
                      Download {mode === "audio" ? "Audio" : "Video"}
                    </>
                  )}
                </span>
              </button>

              {/* Download in progress spinner */}
              {downloadLoading && (
                <LoadingSpinner message="Downloading — this may take a minute for large files…" />
              )}

              {/* Success message */}
              {downloadDone && (
                <div
                  className="flex items-center gap-2 rounded-lg border
                              border-emerald-500/30 bg-emerald-500/10 px-4 py-3
                              text-sm text-emerald-400 animate-fade-in"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Download complete! Check your downloads folder.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
