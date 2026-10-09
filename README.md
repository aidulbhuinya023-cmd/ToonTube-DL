# 🐰 ToonTube DL

> **The 100% Free, Cartoon-Powered Universal Media & Sponsor-Cutter Studio**  
> *Proudly crafted with ❤️ by **Apex Web Studio India**.*

---

## 🌟 Overview

**ToonTube DL** is an open-source, feature-rich web and command-line companion built on top of **yt-dlp** and **FFmpeg**. It provides an intuitive, cartoon-styled interface to download high-fidelity video and audio from thousands of platforms, automatically cut or mark sponsored segments via **SponsorBlock**, harvest multi-lingual subtitles, and export clean Python scripts (`import yt_dlp`).

### ✨ Key Features

- 🎬 **Multi-Format Video Muxing:** Grab up to 4K UHD (`2160p`), 2K QHD (`1440p`), 1080p FHD, 720p, or custom format strings (`bv*+ba/b`).
- 🎵 **Dedicated Audio Extraction:** Convert streams to MP3 (320 kbps CBR, 256k, 192k, VBR 0), lossless FLAC, M4A (AAC), Opus, or WAV.
- ⚡ **SponsorBlock Integration:** Automatically detect and remove (`--sponsorblock-remove`) or bookmark (`--sponsorblock-mark`) sponsors, self-promos, intros, outros, and interaction reminders with real-time seconds-saved calculations.
- 💬 **Subtitle Harvester:** Grab manual and Whisper/ASR auto-generated subtitles, convert to `.srt` or `.vtt`, and embed directly into video containers.
- 📑 **Playlist & Batch Ingestion:** Download full playlists or custom item ranges (`1-10`) with duplicate tracking (`--download-archive archive.txt`).
- 🐍 **Self-Contained Python Generator:** One-click generation and export of native Python scripts using `import yt_dlp`.
- 💻 **Live Interactive Terminal:** Built-in simulated bash terminal runner with real-time transfer progress, speed metrics, and command line executor.
- 🌐 **1,840+ Supported Sites:** Universal scraper support for YouTube, Vimeo, Twitch, SoundCloud, Bandcamp, TikTok, Reddit, Bilibili, Twitter/X, Dailymotion, and raw HTTP/HLS/DASH streams.
- 🔒 **Cloud Sync:** Firebase Auth (Google Sign-In) and Firestore database to keep personal presets and download queues synced across browsers.
- 📖 **Interactive CLI Syntax & Option Guide:** Fast flag lookup and option explanations for custom format selectors, FFmpeg filters, and Python automation.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/toontube-dl.git
cd toontube-dl
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide any required environment variables (see `.env.example`).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Security

- **Server-Side API Handling:** External API calls and token operations run through backend Express routes. No secret keys or private credentials are included in client bundles.
- **Ignored Build Artifacts:** Local configs, dependencies, and temporary build outputs are excluded via `.gitignore`.
- **Database Rules:** Strict Firestore rules (`firestore.rules`) enforce user-level data isolation.

---

## 📜 License & Credits

This project is released under the **MIT License**. It is **100% Free & Open Source**.

Created and maintained by [**Apex Web Studio India**](https://apex-web-studio-india.web.app/frontend/index.html).  
*For questions, collaboration, or custom web engineering, visit [apex-web-studio-india.web.app](https://apex-web-studio-india.web.app/frontend/index.html).*
