# AIO Toolkit

All-in-One utility toolkit web app — process PDFs, images, documents, and more. Built with **Next.js** (React + Tailwind CSS) and **Python FastAPI**.

## Features

- **PDF Tools** — Compress, merge, split, convert to Word/Excel
- **Image Tools** — Resize, compress, format conversion, background removal
- **File Converters** — Word → PDF, Excel → CSV
- **Developer Tools** — QR code generator, secure password generator
- **Everyday Utilities** — Unit converter (length, weight, temperature, speed, data)

## Project Structure

```
project-root/
├── frontend/         ← Next.js app (React + Tailwind CSS v4)
├── backend/          ← Python FastAPI app
└── README.md
```

## Getting Started

### Backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**. Interactive docs at `/docs`.

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Environment Variables

Create `frontend/.env.local` (already included):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For the video downloader, some YouTube URLs require authenticated cookies to work. Set one of these backend environment variables for restricted videos:

```env
YTDLP_COOKIES_FILE=/path/to/youtube_cookies.txt
```

or

```env
YTDLP_COOKIES_B64=<base64-encoded-cookie-file-content>
```

`YTDLP_COOKIES_FILE` should point to a cookies file inside the deployed container. `YTDLP_COOKIES_B64` is safer for many cloud hosts because it stores the cookie file content as a base64 secret.

If you deploy to Render:

1. Export your YouTube cookies locally using `yt-dlp` or your browser.
2. Convert the cookie file to base64:
   ```bash
   base64 -w 0 youtube_cookies.txt
   ```
3. Add `YTDLP_COOKIES_B64` as an environment variable in Render with that encoded value.

If your host does not support multiline env vars, use `YTDLP_COOKIES_B64` instead of `YTDLP_COOKIES_FILE`.

### How to export YouTube cookies

- Using `yt-dlp` directly:
  ```bash
  yt-dlp --cookies-from-browser chrome --skip-download "https://www.youtube.com/watch?v=VIDEO_ID"
  ```
- Alternatively, export cookies from your browser to a text file.

After setting the env variable and redeploying, the backend should be able to use the cookies with yt-dlp and download videos that previously required sign-in.

> Note: This only works for videos accessible with those cookies. Some content may still fail due to additional restrictions or terms of service.

## Tech Stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| Frontend  | Next.js 16, React 19, Tailwind CSS v4, Axios   |
| Backend   | FastAPI, Uvicorn                               |
| PDF       | PyMuPDF (fitz), pikepdf                        |
| Images    | Pillow (PIL)                                   |
| Documents | python-docx, openpyxl                          |
| Utilities | qrcode, secrets                                |

## API Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/pdf/compress`         | Compress PDF             |
| POST   | `/api/pdf/merge`            | Merge multiple PDFs      |
| POST   | `/api/pdf/split`            | Split PDF by page range  |
| POST   | `/api/pdf/to-word`          | PDF → DOCX               |
| POST   | `/api/pdf/to-excel`         | PDF → XLSX               |
| POST   | `/api/image/resize`         | Resize image             |
| POST   | `/api/image/compress`       | Compress image           |
| POST   | `/api/image/convert`        | Convert image format     |
| POST   | `/api/image/remove-bg`      | Remove background        |
| POST   | `/api/convert/word-to-pdf`  | DOCX → PDF               |
| POST   | `/api/convert/excel-to-csv` | XLSX → CSV               |
| POST   | `/api/tools/qr-generate`    | Generate QR code         |
| POST   | `/api/tools/password-generate` | Generate password     |
