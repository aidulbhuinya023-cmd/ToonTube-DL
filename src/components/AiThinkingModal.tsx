import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, Bot, BrainCircuit, Terminal, ArrowRight } from 'lucide-react';
import { CliConfigState } from './OptionsConfigurator';

interface AiThinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CliConfigState;
  url: string;
}

const PRESET_QUERIES = [
  'How do I download an entire playlist skipping duplicates with SponsorBlock?',
  'Explain yt-dlp format strings: how does bv*+ba/b prioritize quality?',
  'How to extract 320kbps MP3s with embedded cover art and chapters?',
  'How to handle YouTube bot detection, rate limits, and cookies?',
  'Write a Python script using yt_dlp to monitor a channel for new uploads.',
];

export const AiThinkingModal: React.FC<AiThinkingModalProps> = ({
  isOpen,
  onClose,
  config,
  url,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Need help constructing a command or understanding options? Search or ask about format strings (`-f`), SponsorBlock trimming, subtitle conversions, rate limiting, or writing Python scripts with `yt_dlp`.',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            url,
            mediaType: config.mediaType,
            quality: config.videoQuality,
            audioFormat: config.audioFormat,
            sponsorBlockAction: config.sponsorBlockAction,
            sponsorBlockCategories: config.sponsorBlockCategories,
            isPlaylist: config.isPlaylist,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI query failed');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error executing high-thinking reasoning: ${err.message || 'Network error'}. Ensure the backend is reachable.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-zinc-100">Command & Flag Reference</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Docs & Syntax
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Search yt-dlp options, format strings, FFmpeg post-processors, and Python examples
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick query chips */}
        <div className="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-zinc-500 flex-shrink-0 font-medium">Popular topics:</span>
          {PRESET_QUERIES.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950 font-sans">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 flex-shrink-0 mt-1">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 flex-shrink-0 mt-1">
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Looking up command syntax and options...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Search flags, options, syntax, or ask for a Python snippet..."
              disabled={isLoading}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-black text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>Search</span>
              <Send className="w-3.5 h-3.5 text-black" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
