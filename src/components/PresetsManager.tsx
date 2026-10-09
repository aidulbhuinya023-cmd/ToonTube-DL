import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, Check, ArrowRight, ShieldCheck, Music, Video, Sparkles } from 'lucide-react';
import { CliPreset } from '../types';
import { CliConfigState } from './OptionsConfigurator';

interface PresetsManagerProps {
  presets: CliPreset[];
  activeConfig: CliConfigState;
  onApplyPreset: (preset: CliPreset) => void;
  onSavePreset: (name: string, description: string) => Promise<void>;
  onDeletePreset: (id: string) => Promise<void>;
  isSignedIn: boolean;
  onSignIn: () => void;
}

const BUILTIN_PRESETS: Array<Omit<CliPreset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Archival 4K + SponsorBlock Cut',
    description: 'Downloads pristine 2160p stream, strips all sponsored segments, embeds chapters and cover art.',
    mediaType: 'video',
    formatQuality: '2160p',
    extractAudio: false,
    embedSubs: true,
    subLangs: 'en,en-orig',
    sponsorBlock: 'sponsor,selfpromo,intro,outro',
    extraArgs: '--add-metadata --embed-chapters --embed-thumbnail',
  },
  {
    name: 'Audiophile Master MP3 320kbps',
    description: 'Extracts highest bitrate audio stream, transcodes to 320k CBR MP3, attaches ID3 tags and album cover.',
    mediaType: 'audio',
    formatQuality: 'best',
    audioFormat: 'mp3',
    extractAudio: true,
    embedSubs: false,
    extraArgs: '--audio-quality 320k --embed-thumbnail --add-metadata',
  },
  {
    name: 'Speedrun / Low Bandwidth 720p',
    description: 'Fast downloading 720p stream with 5MB/s bandwidth throttle to avoid network congestion.',
    mediaType: 'video',
    formatQuality: '720p',
    extractAudio: false,
    embedSubs: true,
    subLangs: 'en',
    extraArgs: '--limit-rate 5M --no-playlist',
  },
  {
    name: 'Complete Subtitle Harvester',
    description: 'Grabs both manual and Whisper/ASR auto-generated subtitles, converts to universal .srt format.',
    mediaType: 'video',
    formatQuality: '1080p',
    extractAudio: false,
    embedSubs: true,
    subLangs: 'all',
    extraArgs: '--write-subs --write-auto-subs --convert-subs srt',
  },
];

export const PresetsManager: React.FC<PresetsManagerProps> = ({
  presets,
  activeConfig,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  isSignedIn,
  onSignIn,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSavePreset(name.trim(), description.trim());
      setName('');
      setDescription('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">CLI Configuration Presets</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Save and load your favorite command configurations and flags
          </p>
        </div>

        {!isSignedIn && (
          <div className="flex items-center space-x-2 text-xs bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-zinc-400">
            <span>Sign in to store custom presets to your account:</span>
            <button
              onClick={onSignIn}
              className="text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Save Current Configuration as New Preset */}
      <form onSubmit={handleCreate} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Current Studio Settings as Preset</span>
          </span>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Preset saved!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Preset Name (e.g., 4K Studio Clean Cut)"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>Save Preset</span>
          </button>
        </div>
      </form>

      {/* Built-in Templates */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Curated Industry Presets:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUILTIN_PRESETS.map((bp, i) => (
            <div
              key={i}
              className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  {bp.mediaType === 'audio' ? (
                    <Music className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Video className="w-4 h-4 text-emerald-400" />
                  )}
                  <h5 className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    {bp.name}
                  </h5>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{bp.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                <span className="text-[10px] font-mono text-zinc-500">
                  {bp.mediaType === 'audio' ? 'MP3 320k' : bp.formatQuality}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onApplyPreset({
                      ...bp,
                      id: `builtin_${i}`,
                      userId: 'system',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white text-[11px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>Apply Preset</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Presets */}
      {presets.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Your Custom Saved Presets:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-emerald-700/60 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-zinc-100 truncate">{preset.name}</h5>
                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {preset.description && (
                    <p className="text-[11px] text-zinc-400 mt-1">{preset.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {preset.mediaType === 'audio' ? preset.audioFormat || 'MP3' : preset.formatQuality}
                  </span>
                  <button
                    onClick={() => onApplyPreset(preset)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white text-[11px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>Load to Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
