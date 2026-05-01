"""
Video Service — video/audio downloading powered by yt-dlp.

Architecture:
  • Info extraction runs entirely in memory (no download).
  • Downloads write to a *temp file* on disk so RAM stays low (~50 MB).
  • The caller streams chunks from the temp file and deletes it when done.
"""

import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import Any

import yt_dlp

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MAX_FILESIZE = int(os.getenv("VIDEO_MAX_FILESIZE_MB", "500")) * 1024 * 1024  # bytes

# Quiet yt-dlp logging
_BASE_OPTS: dict[str, Any] = {
    "quiet": True,
    "no_warnings": True,
    "no_color": True,
}


def _build_opts(extra: dict[str, Any] | None = None) -> dict[str, Any]:
    """Compose yt-dlp options and inject cookies if available."""
    opts = {**_BASE_OPTS}
    cookiefile = os.getenv("YTDLP_COOKIES_FILE")
    if cookiefile:
        if not os.path.exists(cookiefile):
            raise RuntimeError(
                f"YTDLP_COOKIES_FILE is set to '{cookiefile}' but that file does not exist. "
                "Update the path or remove the env var."
            )
        opts["cookiefile"] = cookiefile
    if extra:
        opts.update(extra)
    return opts


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _fmt_filesize(size_bytes: float | int | None) -> str:
    """Human-readable file size string."""
    if not size_bytes:
        return "unknown"
    mb = size_bytes / (1024 * 1024)
    if mb >= 1:
        return f"{mb:.1f} MB"
    kb = size_bytes / 1024
    return f"{kb:.0f} KB"


def _fmt_duration(seconds: int | float | None) -> str:
    """Seconds → human-readable duration."""
    if not seconds:
        return "unknown"
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def _sanitise_filename(name: str) -> str:
    """Remove characters that are unsafe in filenames."""
    name = re.sub(r'[<>:"/\\|?*]', "", name)
    return name.strip() or "video"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _ffmpeg_available() -> bool:
    """Return True when ffmpeg is available on the system PATH."""
    return shutil.which("ffmpeg") is not None


def get_video_info(url: str) -> dict:
    """
    Extract metadata + available formats for a URL.

    Returns
    -------
    dict with keys: title, thumbnail, duration, formats
        Each format entry: {format_id, label, filesize, type, ext}
    """
    opts = _build_opts({
        "skip_download": True,
    })

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as exc:
        message = str(exc)
        if "Sign in to confirm" in message or "confirm you\u2019re not a bot" in message:
            raise ValueError(
                "This YouTube video requires sign-in or cookies. "
                "Deploy with YTDLP_COOKIES_FILE set or try a different URL."
            )
        raise

    if info is None:
        raise ValueError("Could not extract video information from this URL.")

    title = info.get("title", "Untitled")
    thumbnail = info.get("thumbnail")
    duration = _fmt_duration(info.get("duration"))

    raw_formats: list[dict] = info.get("formats") or []

    seen: set[str] = set()
    formats: list[dict] = []

    for f in raw_formats:
        fid = f.get("format_id", "")
        if not fid or fid in seen:
            continue

        ext = f.get("ext", "mp4")
        vcodec = f.get("vcodec", "none")
        acodec = f.get("acodec", "none")
        has_video = vcodec and vcodec != "none"
        has_audio = acodec and acodec != "none"

        filesize = f.get("filesize") or f.get("filesize_approx")

        # Skip formats that exceed the size limit
        if filesize and filesize > MAX_FILESIZE:
            continue

        if has_video and has_audio:
            # Pre-muxed — preferred (no ffmpeg needed)
            height = f.get("height") or 0
            label = f"{height}p {ext.upper()}" if height else f"{ext.upper()}"
            fmt_type = "video"
        elif has_video and not has_audio:
            # Video-only — will need ffmpeg merge
            height = f.get("height") or 0
            label = f"{height}p {ext.upper()} (video only)" if height else f"{ext.upper()} (video only)"
            fmt_type = "video"
        elif has_audio and not has_video:
            # Audio-only
            abr = f.get("abr") or f.get("tbr") or 0
            label = f"Audio {int(abr)}kbps {ext.upper()}" if abr else f"Audio {ext.upper()}"
            fmt_type = "audio"
        else:
            continue

        seen.add(fid)
        formats.append({
            "format_id": fid,
            "label": label,
            "filesize": _fmt_filesize(filesize),
            "filesize_bytes": filesize,
            "type": fmt_type,
            "ext": ext,
            "height": f.get("height") or 0,
            "abr": f.get("abr") or 0,
            "has_audio": has_audio,
        })

    # Sort: video by height desc, audio by bitrate desc
    video_fmts = sorted(
        [f for f in formats if f["type"] == "video"],
        key=lambda x: x["height"],
        reverse=True,
    )
    audio_fmts = sorted(
        [f for f in formats if f["type"] == "audio"],
        key=lambda x: x["abr"],
        reverse=True,
    )

    return {
        "title": title,
        "thumbnail": thumbnail,
        "duration": duration,
        "formats": video_fmts + audio_fmts,
    }


def download_video(
    url: str,
    format_id: str,
    temp_dir: str,
) -> tuple[str, str, str]:
    """
    Download a specific format to *temp_dir*.

    Returns
    -------
    (file_path, filename, mime_type)
        file_path is the absolute path to the downloaded file.
        The caller is responsible for deleting it after streaming.
    """
    # Fetch minimal info to build filename
    info_opts = _build_opts({"skip_download": True})
    with yt_dlp.YoutubeDL(info_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    title = _sanitise_filename(info.get("title", "video") if info else "video")

    # Determine extension from the requested format and whether it is video-only.
    ext = "mp4"
    is_video_only = False
    if info:
        for f in info.get("formats") or []:
            if f.get("format_id") == format_id:
                ext = f.get("ext", "mp4")
                vcodec = f.get("vcodec", "none")
                acodec = f.get("acodec", "none")
                is_video_only = bool(vcodec and vcodec != "none" and not (acodec and acodec != "none"))
                break

    out_template = os.path.join(temp_dir, f"{title}.%(ext)s")

    format_expr = format_id
    if is_video_only:
        if not _ffmpeg_available():
            raise RuntimeError(
                "ffmpeg is required to merge audio for this quality. "
                "Install ffmpeg or select a pre-muxed video format."
            )
        format_expr = f"{format_id}+bestaudio/best"

    dl_opts = _build_opts({
        "format": format_expr,
        "outtmpl": out_template,
        "max_filesize": MAX_FILESIZE,
        # Merge if needed (requires ffmpeg)
        "merge_output_format": ext if ext in ("mp4", "mkv", "webm") else "mp4",
    })

    with yt_dlp.YoutubeDL(dl_opts) as ydl:
        ydl.download([url])

    # Find the downloaded file — yt-dlp may change extension after merge
    downloaded: list[Path] = list(Path(temp_dir).glob(f"{title}.*"))
    if not downloaded:
        raise FileNotFoundError("Download completed but output file was not found.")

    file_path = str(downloaded[0])
    final_ext = downloaded[0].suffix.lstrip(".")
    filename = f"{title}.{final_ext}"

    # MIME mapping
    mime_map = {
        "mp4": "video/mp4",
        "mkv": "video/x-matroska",
        "webm": "video/webm",
        "m4a": "audio/mp4",
        "mp3": "audio/mpeg",
        "opus": "audio/opus",
        "ogg": "audio/ogg",
        "wav": "audio/wav",
        "aac": "audio/aac",
    }
    mime = mime_map.get(final_ext, "application/octet-stream")

    return file_path, filename, mime
