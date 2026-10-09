import React, { useState } from 'react';
import { Layers, Search, Check, Globe, Shield, Radio, Video, Music } from 'lucide-react';

interface ExtractorInfo {
  name: string;
  category: string;
  domain: string;
  features: string[];
  notes: string;
}

const FEATURED_EXTRACTORS: ExtractorInfo[] = [
  {
    name: 'YouTube',
    category: 'Video & Streaming',
    domain: 'youtube.com',
    features: ['4K UHD', 'SponsorBlock', 'Live Streams', 'Subtitles (ASR)', 'Playlists', 'Chapters'],
    notes: 'Primary extractor with multi-format DASH/HLS audio-video muxing and full SponsorBlock support.',
  },
  {
    name: 'SoundCloud',
    category: 'Audio',
    domain: 'soundcloud.com',
    features: ['High-Bitrate MP3', 'Tracks', 'Sets/Playlists', 'Artwork', 'Comments'],
    notes: 'Pulls full discographies, sets, and user tracks with original cover art metadata.',
  },
  {
    name: 'Vimeo',
    category: 'Video & Cinema',
    domain: 'vimeo.com',
    features: ['Original Master Files', 'Password Protected', 'On-Demand', 'Subtitles'],
    notes: 'Extracts progressive direct streams without re-encoding compression.',
  },
  {
    name: 'Twitch',
    category: 'Live & Gaming',
    domain: 'twitch.tv',
    features: ['Live Streams', 'VODs', 'Clips', 'Source 1080p60'],
    notes: 'Handles live stream chunks, chat replay files, and clip archives.',
  },
  {
    name: 'TikTok',
    category: 'Social Media',
    domain: 'tiktok.com',
    features: ['No Watermark', 'HD Audio', 'User Profiles', 'Sound Audio Only'],
    notes: 'Bypasses watermark layer and fetches native high-definition source video.',
  },
  {
    name: 'Bilibili',
    category: 'Anime & Gaming',
    domain: 'bilibili.com',
    features: ['Danmaku (Bullet Comments)', '4K 120fps', 'FLAC Audio', 'Multi-P'],
    notes: 'Supports multi-part episodes, bangumi series, and converts danmaku to ASS subtitles.',
  },
  {
    name: 'Reddit',
    category: 'Social Media',
    domain: 'reddit.com',
    features: ['v.redd.it audio muxing', 'Galleries', 'Comments', 'Subreddit archives'],
    notes: 'Solves silent Reddit video issue by downloading video and audio streams and merging with FFmpeg.',
  },
  {
    name: 'Bandcamp',
    category: 'Audio & Music',
    domain: 'bandcamp.com',
    features: ['Lossless FLAC', 'Full Albums', 'Tracklists', 'Lyrics'],
    notes: 'Pulls complete artist discographies, album art, and lyrics embedded in tags.',
  },
  {
    name: 'Twitter / X',
    category: 'Social Media',
    domain: 'x.com',
    features: ['Best Bitrate MP4', 'Threads', 'Spaces Audio', 'Broadcasts'],
    notes: 'Extracts native MP4 streams from tweets and records live Spaces audio broadcasts.',
  },
  {
    name: 'Facebook & Instagram',
    category: 'Social Media',
    domain: 'instagram.com',
    features: ['Reels', 'Stories', 'IGTV', 'Carousels', 'FB Watch'],
    notes: 'Supports Reels, stories, and high-resolution video posts with session cookies.',
  },
  {
    name: 'Dailymotion',
    category: 'Video Sharing',
    domain: 'dailymotion.com',
    features: ['1080p HD', 'Subtitles', 'Channels', 'Live'],
    notes: 'Fast HLS manifest extraction with auto-reconnect on dropped packets.',
  },
  {
    name: 'Generic Direct Stream (HTTP/HLS/DASH)',
    category: 'Universal Extractor',
    domain: '*.*',
    features: ['M3U8', 'MPD', 'Direct MP4', 'Direct MP3', 'WebM'],
    notes: 'Universal fallback extractor that detects raw media tags, HLS m3u8 playlists, and DASH manifests.',
  },
];

export const ExtractorsCatalog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Video & Streaming', 'Audio', 'Social Media', 'Universal Extractor'];

  const filtered = FEATURED_EXTRACTORS.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(search.toLowerCase()) ||
      ext.domain.toLowerCase().includes(search.toLowerCase()) ||
      ext.features.some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || ext.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Supported Extractors Catalog (1,840+ Sites)
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            yt-dlp is an improved, active fork of youtube-dl with dedicated site scrapers and universal stream sniffers
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-emerald-400">
          <Globe className="w-3.5 h-3.5" />
          <span>Thousands of extractors active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sites, codecs, features (e.g. TikTok, FLAC, Subtitles, Twitch)..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Extractors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ext, idx) => (
          <div
            key={idx}
            className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-100">{ext.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {ext.domain}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{ext.notes}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                Features & Flags:
              </span>
              <div className="flex flex-wrap gap-1">
                {ext.features.map((feat, fIdx) => (
                  <span
                    key={fIdx}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-emerald-400/90 border border-zinc-800 font-medium"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
