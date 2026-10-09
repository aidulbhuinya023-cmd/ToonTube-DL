import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Terminal } from 'lucide-react';
import { CliConfigState } from './OptionsConfigurator';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CliConfigState;
  url: string;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  config,
  url,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const ytdlOptsLines: string[] = [];
  ytdlOptsLines.push(`    'outtmpl': '${config.outputTemplate || '%(title)s [%(id)s].%(ext)s'}',`);

  if (config.mediaType === 'audio') {
    ytdlOptsLines.push(`    'format': 'bestaudio/best',`);
    ytdlOptsLines.push(`    'postprocessors': [`);
    ytdlOptsLines.push(`        {`);
    ytdlOptsLines.push(`            'key': 'FFmpegExtractAudio',`);
    ytdlOptsLines.push(`            'preferredcodec': '${config.audioFormat}',`);
    ytdlOptsLines.push(`            'preferredquality': '${config.audioQuality}',`);
    ytdlOptsLines.push(`        },`);
    if (config.addMetadata) {
      ytdlOptsLines.push(`        {'key': 'FFmpegMetadata'},`);
    }
    if (config.embedThumbnail) {
      ytdlOptsLines.push(`        {'key': 'EmbedThumbnail'},`);
    }
    ytdlOptsLines.push(`    ],`);
  } else {
    if (config.videoQuality === '1080p') {
      ytdlOptsLines.push(`    'format': 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]',`);
    } else if (config.videoQuality === '2160p') {
      ytdlOptsLines.push(`    'format': 'bv*[height<=2160]+ba/b',`);
    } else if (config.videoQuality === '1440p') {
      ytdlOptsLines.push(`    'format': 'bv*[height<=1440]+ba/b',`);
    } else {
      ytdlOptsLines.push(`    'format': 'bestvideo+bestaudio/best',`);
    }

    const pps: string[] = [];
    if (config.addMetadata) pps.push(`{'key': 'FFmpegMetadata'}, {'key': 'FFmpegEmbedSubtitle'}`);
    if (pps.length > 0) {
      ytdlOptsLines.push(`    'postprocessors': [${pps.join(', ')}],`);
    }
  }

  if (config.sponsorBlockAction === 'remove') {
    ytdlOptsLines.push(`    'sponsorblock_remove': ['${config.sponsorBlockCategories.join("', '")}'],`);
  } else if (config.sponsorBlockAction === 'mark') {
    ytdlOptsLines.push(`    'sponsorblock_mark': ['${config.sponsorBlockCategories.join("', '")}'],`);
  }

  if (config.writeSubs || config.embedSubs) {
    ytdlOptsLines.push(`    'writesubtitles': True,`);
    ytdlOptsLines.push(`    'writeautomaticsub': True,`);
    ytdlOptsLines.push(`    'subtitleslangs': ['${config.subLangs.split(',').join("', '")}'],`);
  }

  if (!config.isPlaylist) {
    ytdlOptsLines.push(`    'noplaylist': True,`);
  } else if (config.playlistItems) {
    ytdlOptsLines.push(`    'playlist_items': '${config.playlistItems}',`);
  }

  if (config.rateLimit) {
    ytdlOptsLines.push(`    'ratelimit': ${parseInt(config.rateLimit) || 5000000},`);
  }

  const pythonScript = `#!/usr/bin/env python3
"""
Custom Python Downloader powered by yt-dlp library.
Features:
- Video & Audio high-fidelity extraction
- SponsorBlock automatic segment removal/marking
- Subtitle downloading and embedding
- FFmpeg metadata integration

Requirements:
    pip install yt-dlp
Ensure FFmpeg is installed:
    macOS: brew install ffmpeg
    Ubuntu/Debian: sudo apt install ffmpeg
    Windows: winget install Gyan.FFmpeg
"""

import sys
import yt_dlp

def progress_hook(d):
    if d['status'] == 'downloading':
        total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
        downloaded = d.get('downloaded_bytes', 0)
        pct = (downloaded / total * 100) if total > 0 else 0
        speed = d.get('speed', 0)
        speed_mb = (speed / 1024 / 1024) if speed else 0
        print(f"\\r[download] {pct:.1f}% of ~{total/1024/1024:.2f}MiB at {speed_mb:.2f}MiB/s ETA {d.get('eta', 0)}s", end='')
    elif d['status'] == 'finished':
        print(f"\\n[ffmpeg] Download complete, post-processing stream...")

def download_media(url: str):
    ydl_opts = {
${ytdlOptsLines.join('\n')}
        'progress_hooks': [progress_hook],
    }

    print(f"[*] Ingesting: {url}")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'Unknown')
            print(f"\\n[✓] Finished successfully: {title}")
        except Exception as e:
            print(f"\\n[!] Extraction error: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    target = "${url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}"
    if len(sys.argv) > 1:
        target = sys.argv[1]
    download_media(target)
`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'ytdlp_downloader.py';
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Self-Contained Python Script (import yt_dlp)
              </h3>
              <p className="text-xs text-zinc-400">
                Run natively in Python with full programmatic control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-zinc-950">
          <pre className="text-amber-300 bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 overflow-x-auto whitespace-pre leading-relaxed select-all">
            {pythonScript}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Install dependencies: <code className="text-zinc-200">pip install yt-dlp</code>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyCode}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Python!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={downloadFile}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
