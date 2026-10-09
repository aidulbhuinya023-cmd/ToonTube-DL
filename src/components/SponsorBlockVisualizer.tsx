import React from 'react';
import { ShieldCheck, Scissors, Tag, Info, AlertCircle, Clock } from 'lucide-react';
import { SponsorSegment } from '../types';

interface SponsorBlockVisualizerProps {
  duration: number; // in seconds
  segments: SponsorSegment[];
  action: 'none' | 'remove' | 'mark';
  setAction: (action: 'none' | 'remove' | 'mark') => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string; border: string }> = {
  sponsor: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', label: 'Sponsor' },
  selfpromo: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', label: 'Self Promo' },
  interaction: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500', label: 'Interaction / Like' },
  intro: { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500', label: 'Intro Animation' },
  outro: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500', label: 'Outro / Credits' },
  preview: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500', label: 'Preview / Recap' },
  music_offtopic: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', label: 'Off-topic Music' },
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const SponsorBlockVisualizer: React.FC<SponsorBlockVisualizerProps> = ({
  duration,
  segments,
  action,
  setAction,
  selectedCategories,
  setSelectedCategories,
}) => {
  const safeDuration = duration > 0 ? duration : 300;

  // Calculate total seconds saved
  const filteredSegments = segments.filter((s) => selectedCategories.includes(s.category));
  const totalSavedSeconds = filteredSegments.reduce((sum, s) => {
    return sum + Math.max(0, s.segment[1] - s.segment[0]);
  }, 0);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-zinc-100">SponsorBlock API Integration</h3>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                --sponsorblock
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Community crowd-sourced segments to automatically strip sponsors, intros, and self-promotions
            </p>
          </div>
        </div>

        {/* Action Selector */}
        <div className="flex items-center space-x-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAction('remove')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              action === 'remove'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Remove (--remove)</span>
          </button>
          <button
            type="button"
            onClick={() => setAction('mark')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              action === 'mark'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Mark Chapters (--mark)</span>
          </button>
          <button
            type="button"
            onClick={() => setAction('none')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              action === 'none'
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>0:00</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <Clock className="w-3 h-3" />
            <span>Total: {formatSeconds(safeDuration)}</span>
          </span>
          <span>{formatSeconds(safeDuration)}</span>
        </div>

        {/* Timeline Bar */}
        <div className="relative h-6 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 flex items-center">
          {/* Base timeline grid lines */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-[1px] h-full bg-zinc-500" />
            ))}
          </div>

          {/* Render Sponsor segments */}
          {segments.map((seg, idx) => {
            const startPct = Math.max(0, Math.min(100, (seg.segment[0] / safeDuration) * 100));
            const endPct = Math.max(0, Math.min(100, (seg.segment[1] / safeDuration) * 100));
            const widthPct = Math.max(1, endPct - startPct);
            const conf = CATEGORY_COLORS[seg.category] || CATEGORY_COLORS.sponsor;
            const isEnabled = selectedCategories.includes(seg.category) && action !== 'none';

            return (
              <div
                key={idx}
                className={`absolute top-0 bottom-0 ${conf.bg} transition-all group flex items-center justify-center cursor-pointer ${
                  isEnabled ? 'opacity-90 shadow-sm' : 'opacity-25'
                }`}
                style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                title={`${conf.label}: ${formatSeconds(seg.segment[0])} - ${formatSeconds(seg.segment[1])}`}
              >
                {widthPct > 5 && (
                  <span className="text-[10px] font-bold text-black truncate px-0.5 pointer-events-none">
                    {conf.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats summary */}
        {action !== 'none' && segments.length > 0 && (
          <div className="flex flex-wrap items-center justify-between text-xs pt-1">
            <div className="text-zinc-300 flex items-center space-x-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>
                Found <strong className="text-amber-400">{filteredSegments.length}</strong> segments matching filters.
              </span>
              {action === 'remove' && (
                <span className="text-emerald-400 font-medium">
                  (Saves ~{formatSeconds(totalSavedSeconds)} of playback time)
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              FFmpeg filter: {action === 'remove' ? 'modify_chapters / aselect' : 'embed_chapters'}
            </div>
          </div>
        )}

        {segments.length === 0 && (
          <div className="text-xs text-zinc-400 flex items-center space-x-1.5 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
            <Info className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span>
              No segments registered in the public SponsorBlock database for this specific video ID. Flag{' '}
              <code className="text-amber-300 font-mono text-[11px]">
                --sponsorblock-{action === 'mark' ? 'mark' : 'remove'}
              </code>{' '}
              will still be passed safely during extraction.
            </span>
          </div>
        )}
      </div>

      {/* Category Checkboxes */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-zinc-300 block">Active Categories to Process:</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_COLORS).map(([catKey, info]) => {
            const isChecked = selectedCategories.includes(catKey);
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => toggleCategory(catKey)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                  isChecked
                    ? `bg-zinc-800 ${info.border} ${info.text}`
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${info.bg} ${isChecked ? 'ring-2 ring-white/20' : 'opacity-40'}`} />
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
