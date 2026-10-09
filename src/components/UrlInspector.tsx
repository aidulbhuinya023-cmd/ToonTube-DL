import React, { useState } from 'react';
import { Search, Loader2, PlayCircle, ExternalLink, RefreshCw, Radio, FileVideo, Music } from 'lucide-react';
import { MediaInspectionResult } from '../types';

interface UrlInspectorProps {
  url: string;
  setUrl: (url: string) => void;
  onInspect: (urlToInspect?: string) => Promise<void>;
  isLoading: boolean;
  result: MediaInspectionResult | null;
}

const SAMPLE_URLS = [
  {
    name: 'YouTube 4K & SponsorBlock',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'video',
  },
  {
    name: 'Computerphile Tech Talk',
    url: 'https://www.youtube.com/watch?v=y71CeA_m5bA',
    type: 'video',
  },
  {
    name: 'Vimeo Cinematic Film',
    url: 'https://vimeo.com/76979871',
    type: 'video',
  },
  {
    name: 'SoundCloud Lossless Audio',
    url: 'https://soundcloud.com/forss/flickermood',
    type: 'audio',
  },
  {
    name: 'Playlist Sample (10 tracks)',
    url: 'https://www.youtube.com/playlist?list=PL4fGSIandQ-Gtw1qO_4pZk4f1p9xL1l_6',
    type: 'playlist',
  },
];

export const UrlInspector: React.FC<UrlInspectorProps> = ({
  url,
  setUrl,
  onInspect,
  isLoading,
  result,
}) => {
  const [inputUrl, setInputUrl] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setUrl(inputUrl.trim());
      onInspect(inputUrl.trim());
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
    setUrl(sampleUrl);
    onInspect(sampleUrl);
  };

  return (
    <div className="bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] space-y-4">
      {/* Search Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>🍿 Drop Any Media or Playlist Link</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono">
              1,840+ Sites
            </span>
          </label>
          <span className="text-[11px] font-bold text-zinc-400 hidden sm:inline">
            Free forever by{' '}
            <a
              href="https://apex-web-studio-india.web.app/frontend/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors"
              title="Visit Apex Web Studio India"
            >
              Apex Web Studio India
            </a>
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste YouTube, Vimeo, Twitch, SoundCloud, Bilibili, or any video/audio link..."
              className="w-full bg-zinc-950 border-2 border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputUrl.trim()}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-extrabold text-sm flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inspecting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Inspect Media</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Preset samples */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-zinc-400 font-medium flex items-center space-x-1">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>Quick Samples:</span>
        </span>
        {SAMPLE_URLS.map((sample, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer flex items-center space-x-1"
          >
            {sample.type === 'video' && <FileVideo className="w-3 h-3 text-emerald-400" />}
            {sample.type === 'audio' && <Music className="w-3 h-3 text-purple-400" />}
            <span>{sample.name}</span>
          </button>
        ))}
      </div>

      {/* Inspection Result Preview Banner */}
      {result && (
        <div className="mt-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-44 h-28 sm:h-24 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 group">
            {result.thumbnail ? (
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <PlayCircle className="w-8 h-8" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-zinc-800">
              {Math.floor(result.duration / 60)}:
              {result.duration % 60 < 10 ? '0' : ''}
              {result.duration % 60}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                {result.extractor}
              </span>
              {result.isPlaylist && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800/80">
                  PLAYLIST
                </span>
              )}
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 hover:text-zinc-300 text-xs inline-flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h4 className="text-sm font-semibold text-zinc-100 truncate" title={result.title}>
              {result.title}
            </h4>

            <p className="text-xs text-zinc-400 truncate">
              By <span className="text-zinc-200 font-medium">{result.author}</span> •{' '}
              {result.formats.length} streams available • {result.subtitles.length} subtitle tracks
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.formats.slice(0, 5).map((fmt, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  {fmt.resolution} ({fmt.ext})
                </span>
              ))}
              {result.formats.length > 5 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-400">
                  +{result.formats.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
