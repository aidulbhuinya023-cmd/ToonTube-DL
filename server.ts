import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || parsed.pathname.split('/').pop() || null;
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

// SponsorBlock segments proxy/fetcher
app.get('/api/sponsorblock/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  try {
    const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(
      videoId
    )}&categories=["sponsor","selfpromo","interaction","intro","outro","preview","music_offtopic"]`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'yt-dlp-studio/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.status === 404) {
      return res.json({ segments: [], count: 0, message: 'No sponsor segments registered for this video.' });
    }

    if (!response.ok) {
      return res.json({ segments: [], count: 0, message: 'SponsorBlock service unavailable or rate-limited' });
    }

    const data = await response.json();
    return res.json({ segments: Array.isArray(data) ? data : [], count: Array.isArray(data) ? data.length : 0 });
  } catch (err: any) {
    return res.json({ segments: [], count: 0, message: err.message || 'SponsorBlock request timed out' });
  }
});

// URL Inspector endpoint
app.post('/api/inspect', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  try {
    let hostname = 'unknown';
    try {
      hostname = new URL(url).hostname;
    } catch {
      // not a full url
    }

    const ytId = extractYouTubeId(url);
    let title = 'Extracted Media Stream';
    let author = 'Unknown Creator';
    let thumbnail = '';
    let duration = 342; // default ~5m 42s
    let sponsorSegments: any[] = [];

    if (ytId) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`, {
          signal: AbortSignal.timeout(4000),
        });
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          title = oembedData.title || title;
          author = oembedData.author_name || author;
          thumbnail = oembedData.thumbnail_url || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
        }
      } catch {
        thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      }

      if (!thumbnail) {
        thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      }

      // Query SponsorBlock
      try {
        const sbRes = await fetch(
          `https://sponsor.ajay.app/api/skipSegments?videoID=${ytId}&categories=["sponsor","selfpromo","interaction","intro","outro"]`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (sbRes.ok) {
          sponsorSegments = await sbRes.json();
        }
      } catch {}
    } else if (hostname.includes('vimeo')) {
      title = 'Vimeo Production Showcase';
      author = 'Vimeo Creator';
    } else if (hostname.includes('soundcloud')) {
      title = 'SoundCloud High-Bitrate Master';
      author = 'Audio Producer';
    } else {
      const parts = url.split('/');
      title = `Media from ${hostname} (${parts[parts.length - 1] || 'stream'})`;
      author = hostname;
    }

    // Comprehensive format hierarchy
    const availableFormats = [
      { id: '313+251', resolution: '2160p (4K UHD)', ext: 'mkv', fps: 60, vcodec: 'vp9', acodec: 'opus', note: 'Best Ultra HD', filesizeApprox: '~850 MB' },
      { id: '271+251', resolution: '1440p (2K QHD)', ext: 'mkv', fps: 60, vcodec: 'vp9', acodec: 'opus', note: 'High Definition', filesizeApprox: '~420 MB' },
      { id: '137+140', resolution: '1080p (Full HD)', ext: 'mp4', fps: 60, vcodec: 'avc1', acodec: 'mp4a', note: 'Standard recommended', filesizeApprox: '~180 MB' },
      { id: '22', resolution: '720p (HD)', ext: 'mp4', fps: 30, vcodec: 'avc1', acodec: 'mp4a', note: 'Fast download', filesizeApprox: '~85 MB' },
      { id: '18', resolution: '360p (SD)', ext: 'mp4', fps: 30, vcodec: 'avc1', acodec: 'mp4a', note: 'Data Saver', filesizeApprox: '~30 MB' },
      { id: 'audio-mp3-320', resolution: 'Audio Only', ext: 'mp3', vcodec: 'none', acodec: 'mp3 (320kbps)', note: 'Lossy High Quality', filesizeApprox: '~14 MB' },
      { id: 'audio-flac', resolution: 'Audio Only', ext: 'flac', vcodec: 'none', acodec: 'flac', note: 'Lossless Studio Master', filesizeApprox: '~42 MB' },
      { id: 'audio-m4a', resolution: 'Audio Only', ext: 'm4a', vcodec: 'none', acodec: 'aac (256kbps)', note: 'Apple / Universal Audio', filesizeApprox: '~11 MB' },
      { id: 'audio-opus', resolution: 'Audio Only', ext: 'opus', vcodec: 'none', acodec: 'opus (160kbps)', note: 'Modern Speech & Music', filesizeApprox: '~8 MB' },
    ];

    const availableSubtitles = [
      { code: 'en', name: 'English (Original)', auto: false },
      { code: 'en-orig', name: 'English (Auto-generated ASR)', auto: true },
      { code: 'es', name: 'Spanish', auto: false },
      { code: 'fr', name: 'French', auto: false },
      { code: 'de', name: 'German', auto: false },
      { code: 'ja', name: 'Japanese', auto: false },
    ];

    res.json({
      url,
      id: ytId || 'generic_media',
      title,
      author,
      thumbnail,
      duration,
      extractor: ytId ? 'youtube' : hostname,
      isPlaylist: url.includes('list='),
      sponsorSegments: Array.isArray(sponsorSegments) ? sponsorSegments : [],
      formats: availableFormats,
      subtitles: availableSubtitles,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Inspection failed' });
  }
});

// AI Thinking mode endpoint (Gemini 3.8 Flash with High Thinking level)
app.post('/api/ai/query', async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const systemInstruction = `You are the Lead Maintainer and Architect of yt-dlp (the popular Python CLI media extractor) and FFmpeg processing pipelines.
You have exhaustive mastery over:
1. All yt-dlp CLI flags, options, syntax, format selection strings (e.g. -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best").
2. SponsorBlock integration: --sponsorblock-mark, --sponsorblock-remove, categories (sponsor, intro, outro, selfpromo, preview, interaction), and chapter handling.
3. Subtitle handling: --write-subs, --write-auto-subs, --sub-langs, --embed-subs, --convert-subs srt/vtt.
4. Audio extraction: -x, --extract-audio, --audio-format mp3/flac/m4a/opus, --audio-quality 0 or 320k, --embed-thumbnail, --add-metadata.
5. Playlist handling: --yes-playlist, --playlist-items 1:10, --download-archive archive.txt, --match-filter.
6. Python library usage: writing clean, modular Python scripts using "import yt_dlp".
7. Rate limiting, proxying, cookies, geo-bypass, and FFmpeg postprocessor configuration.

Respond thoroughly, provide clean copyable shell commands, terminal outputs, or Python snippets where appropriate. Maintain high technical precision.`;

    const contents = context
      ? `Current Configuration Context: ${JSON.stringify(context, null, 2)}\n\nUser Question: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message || 'AI processing failed' });
  }
});

// CLI Command & Python script generator endpoint
app.post('/api/cli/build', (req, res) => {
  const options = req.body || {};
  const {
    url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mediaType = 'video', // 'video' | 'audio'
    videoQuality = '1080p', // 'best', '2160p', '1440p', '1080p', '720p', '480p'
    audioFormat = 'mp3', // 'mp3', 'flac', 'm4a', 'opus', 'wav'
    audioQuality = '320k', // '320k', '256k', '192k', '128k', '0'
    embedSubs = true,
    writeSubs = true,
    subLangs = 'en,en-orig',
    sponsorBlockAction = 'remove', // 'none' | 'remove' | 'mark'
    sponsorBlockCategories = 'sponsor,selfpromo,intro,outro',
    embedThumbnail = true,
    addMetadata = true,
    isPlaylist = false,
    playlistItems = '1-10',
    outputTemplate = '%(title)s [%(id)s].%(ext)s',
    rateLimit = '',
    customArgs = '',
  } = options;

  const cliFlags: string[] = ['yt-dlp'];

  // Media & format flags
  if (mediaType === 'audio') {
    cliFlags.push('-x');
    cliFlags.push(`--audio-format ${audioFormat}`);
    cliFlags.push(`--audio-quality ${audioQuality}`);
  } else {
    if (videoQuality === 'best') {
      cliFlags.push('-f "bv*+ba/b"');
    } else if (videoQuality === '2160p') {
      cliFlags.push('-f "bv*[height<=2160]+ba/b[height<=2160]"');
    } else if (videoQuality === '1440p') {
      cliFlags.push('-f "bv*[height<=1440]+ba/b[height<=1440]"');
    } else if (videoQuality === '1080p') {
      cliFlags.push('-f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]"');
    } else if (videoQuality === '720p') {
      cliFlags.push('-f "bv*[height<=720]+ba/b[height<=720]"');
    } else {
      cliFlags.push('-f "bv*+ba/b"');
    }
  }

  // Subtitles
  if (embedSubs || writeSubs) {
    if (writeSubs) cliFlags.push('--write-subs --write-auto-subs');
    if (embedSubs && mediaType === 'video') cliFlags.push('--embed-subs');
    if (subLangs) cliFlags.push(`--sub-langs "${subLangs}"`);
  }

  // SponsorBlock
  if (sponsorBlockAction === 'remove') {
    cliFlags.push(`--sponsorblock-remove "${sponsorBlockCategories}"`);
  } else if (sponsorBlockAction === 'mark') {
    cliFlags.push(`--sponsorblock-mark "${sponsorBlockCategories}"`);
  }

  // Metadata & Thumbnails
  if (embedThumbnail) cliFlags.push('--embed-thumbnail');
  if (addMetadata) cliFlags.push('--add-metadata --embed-chapters');

  // Playlist
  if (!isPlaylist) {
    cliFlags.push('--no-playlist');
  } else if (playlistItems) {
    cliFlags.push(`--yes-playlist --playlist-items "${playlistItems}"`);
  }

  // Output template
  if (outputTemplate) {
    cliFlags.push(`-o "${outputTemplate}"`);
  }

  // Rate limit
  if (rateLimit) {
    cliFlags.push(`--limit-rate ${rateLimit}`);
  }

  // Custom user args
  if (customArgs && customArgs.trim()) {
    cliFlags.push(customArgs.trim());
  }

  // Append URL
  cliFlags.push(`"${url}"`);

  const bashCommand = cliFlags.join(' \\\n  ');
  const singleLineCommand = cliFlags.join(' ');
  const powershellCommand = cliFlags.join(' `\n  ');

  // Python equivalent code
  const ytdlOptsLines: string[] = [];
  ytdlOptsLines.push(`    'outtmpl': '${outputTemplate}',`);
  if (mediaType === 'audio') {
    ytdlOptsLines.push(`    'format': 'bestaudio/best',`);
    ytdlOptsLines.push(`    'postprocessors': [`);
    ytdlOptsLines.push(`        {`);
    ytdlOptsLines.push(`            'key': 'FFmpegExtractAudio',`);
    ytdlOptsLines.push(`            'preferredcodec': '${audioFormat}',`);
    ytdlOptsLines.push(`            'preferredquality': '${audioQuality}',`);
    ytdlOptsLines.push(`        },`);
    if (addMetadata) {
      ytdlOptsLines.push(`        {'key': 'FFmpegMetadata'},`);
    }
    if (embedThumbnail) {
      ytdlOptsLines.push(`        {'key': 'EmbedThumbnail'},`);
    }
    ytdlOptsLines.push(`    ],`);
  } else {
    if (videoQuality === '1080p') {
      ytdlOptsLines.push(`    'format': 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]',`);
    } else if (videoQuality === '2160p') {
      ytdlOptsLines.push(`    'format': 'bv*[height<=2160]+ba/b',`);
    } else {
      ytdlOptsLines.push(`    'format': 'bestvideo+bestaudio/best',`);
    }
    const pps: string[] = [];
    if (addMetadata) pps.push(`{'key': 'FFmpegMetadata'}, {'key': 'FFmpegEmbedSubtitle'}`);
    if (pps.length > 0) {
      ytdlOptsLines.push(`    'postprocessors': [${pps.join(', ')}],`);
    }
  }

  if (sponsorBlockAction === 'remove') {
    ytdlOptsLines.push(`    'sponsorblock_remove': ['${sponsorBlockCategories.split(',').join("', '")}'],`);
  } else if (sponsorBlockAction === 'mark') {
    ytdlOptsLines.push(`    'sponsorblock_mark': ['${sponsorBlockCategories.split(',').join("', '")}'],`);
  }

  if (embedSubs || writeSubs) {
    ytdlOptsLines.push(`    'writesubtitles': True,`);
    ytdlOptsLines.push(`    'writeautomaticsub': True,`);
    ytdlOptsLines.push(`    'subtitleslangs': ['${subLangs.split(',').join("', '")}'],`);
  }

  if (!isPlaylist) {
    ytdlOptsLines.push(`    'noplaylist': True,`);
  }

  const pythonScript = `#!/usr/bin/env python3
"""
Production yt-dlp downloader script with SponsorBlock and Subtitles.
Requires: pip install yt-dlp
Ensure FFmpeg is installed and accessible in system PATH.
"""
import sys
import yt_dlp

def download_media(url: str):
    ydl_opts = {
${ytdlOptsLines.join('\n')}
    }

    print(f"[*] Starting ingestion for: {url}")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        title = info_dict.get('title', 'Media')
        print(f"[✓] Successfully downloaded: {title}")

if __name__ == "__main__":
    target_url = "${url}"
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    download_media(target_url)
`;

  res.json({
    bashCommand,
    singleLineCommand,
    powershellCommand,
    pythonScript,
    optionsUsed: options,
  });
});

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`yt-dlp Studio server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
