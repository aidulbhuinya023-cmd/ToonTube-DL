import React from 'react';
import {
  Video,
  Music,
  Subtitles,
  ListOrdered,
  Sliders,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Gauge,
  FolderOutput,
} from 'lucide-react';

export interface CliConfigState {
  mediaType: 'video' | 'audio';
  videoQuality: string;
  audioFormat: string;
  audioQuality: string;
  embedSubs: boolean;
  writeSubs: boolean;
  subLangs: string;
  convertSubs: string;
  sponsorBlockAction: 'none' | 'remove' | 'mark';
  sponsorBlockCategories: string[];
  isPlaylist: boolean;
  playlistItems: string;
  useArchive: boolean;
  embedThumbnail: boolean;
  addMetadata: boolean;
  rateLimit: string;
  outputTemplate: string;
  customArgs: string;
}

interface OptionsConfiguratorProps {
  config: CliConfigState;
  setConfig: React.Dispatch<React.SetStateAction<CliConfigState>>;
}

export const OptionsConfigurator: React.FC<OptionsConfiguratorProps> = ({ config, setConfig }) => {
  const updateField = <K extends keyof CliConfigState>(field: K, value: CliConfigState[K]) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Top Media Type Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Ingestion Mode & Stream Selection</span>
          </h3>
          <p className="text-xs text-zinc-400">Choose between full video muxing or dedicated audio extraction</p>
        </div>

        {/* Toggle Video vs Audio */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => updateField('mediaType', 'video')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              config.mediaType === 'video'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video & Mux</span>
          </button>
          <button
            type="button"
            onClick={() => updateField('mediaType', 'audio')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              config.mediaType === 'audio'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio Only (-x)</span>
          </button>
        </div>
      </div>

      {/* Grid: Video vs Audio Settings */}
      {config.mediaType === 'video' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video Resolution */}
          <div className="space-y-1.5 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Target Video Quality / Resolution:</span>
              <span className="text-[11px] font-mono text-emerald-400">--format</span>
            </label>
            <select
              value={config.videoQuality}
              onChange={(e) => updateField('videoQuality', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="best">Highest Available (bv*+ba/b)</option>
              <option value="2160p">4K UHD (2160p)</option>
              <option value="1440p">2K QHD (1440p)</option>
              <option value="1080p">1080p Full HD (Recommended MP4)</option>
              <option value="720p">720p HD (Balanced Speed)</option>
              <option value="480p">480p SD (Data Saver)</option>
              <option value="360p">360p Low (Minimal bandwidth)</option>
            </select>
            <p className="text-[11px] text-zinc-500">
              Combines best isolated video stream with highest bitrate audio stream via FFmpeg muxer.
            </p>
          </div>

          {/* Subtitles Configuration */}
          <div className="space-y-2 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Subtitle & Closed Caption Extraction</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.writeSubs}
                  onChange={(e) => updateField('writeSubs', e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
                />
                <span>Grab Auto & Manual Subs</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.embedSubs}
                  onChange={(e) => updateField('embedSubs', e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
                />
                <span>Embed into Video (--embed-subs)</span>
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <div className="flex-1">
                <input
                  type="text"
                  value={config.subLangs}
                  onChange={(e) => updateField('subLangs', e.target.value)}
                  placeholder="en,es,fr,all"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
                  title="Subtitle language codes separated by commas"
                />
              </div>
              <select
                value={config.convertSubs}
                onChange={(e) => updateField('convertSubs', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 font-mono"
              >
                <option value="srt">SRT format</option>
                <option value="vtt">VTT format</option>
                <option value="ass">ASS / SSA</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Audio Only Settings */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Audio Format */}
          <div className="space-y-1.5 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Target Audio Format / Codec:</span>
              <span className="text-[11px] font-mono text-purple-400">--audio-format</span>
            </label>
            <select
              value={config.audioFormat}
              onChange={(e) => updateField('audioFormat', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-purple-500"
            >
              <option value="mp3">MP3 (MPEG Audio Layer III)</option>
              <option value="flac">FLAC (Free Lossless Audio Codec)</option>
              <option value="m4a">M4A (Apple AAC Audio)</option>
              <option value="opus">Opus (Modern High-Efficiency Audio)</option>
              <option value="wav">WAV (Uncompressed PCM Waveform)</option>
            </select>
            <p className="text-[11px] text-zinc-500">
              Extracts raw stream and post-processes through FFmpeg audio filter.
            </p>
          </div>

          {/* Audio Bitrate Quality */}
          <div className="space-y-1.5 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Audio Bitrate Quality:</span>
              <span className="text-[11px] font-mono text-purple-400">--audio-quality</span>
            </label>
            <select
              value={config.audioQuality}
              onChange={(e) => updateField('audioQuality', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-purple-500"
            >
              <option value="320k">320 kbps (Maximum High Fidelity)</option>
              <option value="256k">256 kbps (Studio Standard)</option>
              <option value="192k">192 kbps (Transparent Quality)</option>
              <option value="128k">128 kbps (Compact Web Audio)</option>
              <option value="0">0 (Best VBR Variable Bitrate)</option>
            </select>
            <p className="text-[11px] text-zinc-500">
              Ensures constant or highest variable acoustic density for musical recordings.
            </p>
          </div>
        </div>
      )}

      {/* Playlist & Batch Options */}
      <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
            <span>Playlist & Batch Download Management</span>
          </label>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.isPlaylist}
                onChange={(e) => updateField('isPlaylist', e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              />
              <span>Enable Playlist Mode (--yes-playlist)</span>
            </label>
          </div>
        </div>

        {config.isPlaylist && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Playlist Items Range (--playlist-items):
              </label>
              <input
                type="text"
                value={config.playlistItems}
                onChange={(e) => updateField('playlistItems', e.target.value)}
                placeholder="1-10 or 1:5 or 1,3,5"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Download Archive Tracker (--download-archive):
              </label>
              <label className="flex items-center space-x-2 text-xs text-zinc-300 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.useArchive}
                  onChange={(e) => updateField('useArchive', e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-500"
                />
                <span>Skip previously downloaded files (archive.txt)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Tagging & Output Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metadata & Chapters */}
        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Metadata & Chapters</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.addMetadata}
              onChange={(e) => updateField('addMetadata', e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-emerald-500"
            />
            <span>--add-metadata & chapters</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.embedThumbnail}
              onChange={(e) => updateField('embedThumbnail', e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-emerald-500"
            />
            <span>--embed-thumbnail (Cover Art)</span>
          </label>
        </div>

        {/* Output Filename Template */}
        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
            <FolderOutput className="w-3.5 h-3.5 text-blue-400" />
            <span>Output Path Template (-o)</span>
          </label>
          <input
            type="text"
            value={config.outputTemplate}
            onChange={(e) => updateField('outputTemplate', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
            placeholder="%(title)s [%(id)s].%(ext)s"
          />
          <p className="text-[10px] text-zinc-500 font-mono">Supports %(channel)s, %(upload_date)s</p>
        </div>

        {/* Bandwidth Limiter */}
        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Speed Rate Limit (--limit-rate)</span>
          </label>
          <input
            type="text"
            value={config.rateLimit}
            onChange={(e) => updateField('rateLimit', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
            placeholder="e.g. 5M, 500K (leave empty for max)"
          />
          <p className="text-[10px] text-zinc-500">Throttles download bandwidth to prevent ISP throttling</p>
        </div>
      </div>

      {/* Custom Arguments input */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
          <span>Custom Extra Arguments (Appended to command):</span>
          <span className="text-[11px] font-mono text-zinc-500">e.g. --cookies cookies.txt --geo-bypass</span>
        </label>
        <input
          type="text"
          value={config.customArgs}
          onChange={(e) => updateField('customArgs', e.target.value)}
          placeholder="--no-check-certificates --extractor-retries 3"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};
