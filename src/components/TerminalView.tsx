import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  Play,
  Code,
  Download,
  Trash2,
  Maximize2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { CliConfigState } from './OptionsConfigurator';
import { MediaInspectionResult, DownloadJob } from '../types';

interface TerminalViewProps {
  url: string;
  config: CliConfigState;
  inspection: MediaInspectionResult | null;
  onExecuteJob: (jobData: Partial<DownloadJob>) => Promise<void>;
  openPythonModal: () => void;
  openAiModal: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  url,
  config,
  inspection,
  onExecuteJob,
  openPythonModal,
  openAiModal,
}) => {
  const [logs, setLogs] = useState<string[]>([
    '🐰 ToonTube DL v2026.10.08 [Free Engine by Apex Web Studio India • yt-dlp & FFmpeg 7.0]',
    'Ready. Configure options above or click "Run Pipeline & Download" below.',
    'Type "help" or run any yt-dlp command in the interactive prompt below.',
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [cliInput, setCliInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Generate the actual CLI command based on options
  const generateCommand = (multiline = false) => {
    const flags: string[] = ['yt-dlp'];

    if (config.mediaType === 'audio') {
      flags.push('-x');
      flags.push(`--audio-format ${config.audioFormat}`);
      flags.push(`--audio-quality ${config.audioQuality}`);
    } else {
      if (config.videoQuality === 'best') {
        flags.push('-f "bv*+ba/b"');
      } else if (config.videoQuality === '2160p') {
        flags.push('-f "bv*[height<=2160]+ba/b"');
      } else if (config.videoQuality === '1440p') {
        flags.push('-f "bv*[height<=1440]+ba/b"');
      } else if (config.videoQuality === '1080p') {
        flags.push('-f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]"');
      } else if (config.videoQuality === '720p') {
        flags.push('-f "bv*[height<=720]+ba/b"');
      } else {
        flags.push('-f "bv*+ba/b"');
      }
    }

    if (config.writeSubs || config.embedSubs) {
      if (config.writeSubs) flags.push('--write-subs --write-auto-subs');
      if (config.embedSubs && config.mediaType === 'video') flags.push('--embed-subs');
      if (config.subLangs) flags.push(`--sub-langs "${config.subLangs}"`);
      if (config.convertSubs) flags.push(`--convert-subs ${config.convertSubs}`);
    }

    if (config.sponsorBlockAction === 'remove') {
      flags.push(`--sponsorblock-remove "${config.sponsorBlockCategories.join(',')}"`);
    } else if (config.sponsorBlockAction === 'mark') {
      flags.push(`--sponsorblock-mark "${config.sponsorBlockCategories.join(',')}"`);
    }

    if (config.addMetadata) flags.push('--add-metadata --embed-chapters');
    if (config.embedThumbnail) flags.push('--embed-thumbnail');

    if (!config.isPlaylist) {
      flags.push('--no-playlist');
    } else {
      flags.push('--yes-playlist');
      if (config.playlistItems) flags.push(`--playlist-items "${config.playlistItems}"`);
      if (config.useArchive) flags.push('--download-archive archive.txt');
    }

    if (config.outputTemplate) flags.push(`-o "${config.outputTemplate}"`);
    if (config.rateLimit) flags.push(`--limit-rate ${config.rateLimit}`);
    if (config.customArgs.trim()) flags.push(config.customArgs.trim());

    flags.push(`"${url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}"`);

    return multiline ? flags.join(' \\\n  ') : flags.join(' ');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSimulateExecution = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    const targetTitle = inspection?.title || 'Extracted Media File';
    const targetId = inspection?.id || 'media_01';
    const extractorName = inspection?.extractor || 'youtube';
    const extension = config.mediaType === 'audio' ? config.audioFormat : 'mp4';
    const formatName = config.mediaType === 'audio' ? `audio-${config.audioFormat}` : config.videoQuality;

    const fullCmd = generateCommand(false);

    setLogs((prev) => [
      ...prev,
      '',
      `user@linux:~$ ${fullCmd}`,
      `[${extractorName}] Extracting URL: ${url}`,
      `[${extractorName}] ${targetId}: Downloading webpage`,
      `[${extractorName}] ${targetId}: Downloading android player API JSON`,
      `[info] ${targetId}: Downloading 1 format(s): ${config.mediaType === 'audio' ? '140 (audio)' : '137+140 (1080p)'}`,
    ]);

    // SponsorBlock log
    if (config.sponsorBlockAction !== 'none') {
      await new Promise((r) => setTimeout(r, 600));
      const cats = config.sponsorBlockCategories.join(', ');
      setLogs((prev) => [
        ...prev,
        `[SponsorBlock] Querying API for videoID "${targetId}" with categories: [${cats}]...`,
        `[SponsorBlock] Found 2 segment(s) to ${config.sponsorBlockAction}:`,
        `  -> [00:00:35.000 - 00:01:12.500]: sponsor`,
        `  -> [00:08:40.000 - 00:09:05.000]: selfpromo`,
      ]);
    }

    // Subtitle log
    if (config.writeSubs || config.embedSubs) {
      await new Promise((r) => setTimeout(r, 500));
      setLogs((prev) => [
        ...prev,
        `[info] Writing video subtitles to: ${targetTitle}.en.vtt`,
        `[info] Converting subtitles to: ${config.convertSubs || 'srt'}`,
      ]);
    }

    // Download progress steps
    const progressSteps = [
      { pct: 15, speed: '8.4MiB/s', eta: '00:08' },
      { pct: 42, speed: '12.1MiB/s', eta: '00:05' },
      { pct: 78, speed: '14.8MiB/s', eta: '00:02' },
      { pct: 100, speed: '13.2MiB/s', eta: '00:00' },
    ];

    for (const step of progressSteps) {
      await new Promise((r) => setTimeout(r, 500));
      setLogs((prev) => [
        ...prev,
        `[download]  ${step.pct}% of ~48.25MiB at ${step.speed} ETA ${step.eta}`,
      ]);
    }

    // FFmpeg postprocessing
    await new Promise((r) => setTimeout(r, 600));
    if (config.sponsorBlockAction === 'remove') {
      setLogs((prev) => [
        ...prev,
        `[ffmpeg] Merging and cutting SponsorBlock segments [0:35-1:12, 8:40-9:05]...`,
        `[ModifyChapters] Applying cleaned chapters table...`,
      ]);
    }

    if (config.mediaType === 'audio') {
      setLogs((prev) => [
        ...prev,
        `[ExtractAudio] Destination: ${targetTitle}.${config.audioFormat}`,
        `[Metadata] Adding ID3 tags and cover art...`,
      ]);
    } else if (config.embedSubs) {
      setLogs((prev) => [
        ...prev,
        `[EmbedSubtitle] Embedding subtitles into container "${targetTitle}.${extension}"`,
      ]);
    }

    await new Promise((r) => setTimeout(r, 400));
    const outputFilename = `${targetTitle}.${extension}`;
    setLogs((prev) => [
      ...prev,
      `[download] 100% of 48.25MiB in 00:04 at 12.06MiB/s`,
      `[download] Finished downloading: "${outputFilename}"`,
      `[✓] Execution completed successfully with exit code 0.`,
    ]);

    // Persist to Firestore download queue
    await onExecuteJob({
      title: targetTitle,
      url,
      extractor: extractorName,
      mediaType: config.mediaType,
      quality: formatName,
      audioFormat: config.mediaType === 'audio' ? (config.audioFormat as any) : undefined,
      subtitles: config.embedSubs || config.writeSubs,
      subLangs: config.subLangs,
      sponsorBlockAction: config.sponsorBlockAction,
      sponsorBlockCategories: config.sponsorBlockCategories.join(','),
      cliCommand: fullCmd,
      status: 'completed',
      progress: 100,
      fileSize: config.mediaType === 'audio' ? '12.4 MB' : '48.2 MB',
      downloadSpeed: '12.1 MiB/s',
      outputPath: outputFilename,
      isPlaylist: config.isPlaylist,
    });

    setIsExecuting(false);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    setCliInput('');

    if (cmd === 'clear') {
      setLogs([]);
      return;
    }

    if (cmd === 'help') {
      setLogs((prev) => [
        ...prev,
        `user@linux:~$ ${cmd}`,
        'yt-dlp Studio Interactive Help:',
        '  run              - Execute the currently configured command with simulated extraction',
        '  clear            - Clear the terminal screen',
        '  version          - Show yt-dlp version and FFmpeg build info',
        '  formats          - List simulated available stream formats (-F)',
        '  extractors       - Count supported extractors (over 1,800+ sites)',
        '  Any custom command starting with "yt-dlp" will be parsed!',
      ]);
      return;
    }

    if (cmd === 'version' || cmd === 'yt-dlp --version') {
      setLogs((prev) => [...prev, `user@linux:~$ ${cmd}`, '2026.10.08']);
      return;
    }

    if (cmd === 'run') {
      handleSimulateExecution();
      return;
    }

    if (cmd === 'extractors') {
      setLogs((prev) => [
        ...prev,
        `user@linux:~$ ${cmd}`,
        '[yt-dlp] 1,842 extractors actively supported (YouTube, Vimeo, Twitch, SoundCloud, Bandcamp, Bilibili, TikTok, Twitter/X, Reddit, etc.)',
      ]);
      return;
    }

    if (cmd.startsWith('yt-dlp -F') || cmd === 'formats') {
      setLogs((prev) => [
        ...prev,
        `user@linux:~$ ${cmd}`,
        '[info] Available formats for stream:',
        'ID  EXT   RESOLUTION FPS │   FILESIZE   TBR PROTO │ VCODEC        VBR ACODEC      ABR',
        '140 m4a   audio only     │   14.20MiB  129k https │ audio only        mp4a.40.2  128k',
        '251 webm  audio only     │   16.40MiB  156k https │ audio only        opus       160k',
        '137 mp4   1920x1080   60 │  180.20MiB 4200k https │ avc1.64002a 4200k video only',
        '271 webm  2560x1440   60 │  420.50MiB 8900k https │ vp9         8900k video only',
        '313 webm  3840x2160   60 │  850.10MiB 18.2M https │ vp9        18200k video only',
      ]);
      return;
    }

    // Default echo
    setLogs((prev) => [
      ...prev,
      `user@linux:~$ ${cmd}`,
      `[yt-dlp CLI] Executed command with custom arguments: "${cmd}". Click "Run Pipeline & Download" to run complete end-to-end ingestion!`,
    ]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const bashSingle = generateCommand(false);
  const bashMulti = generateCommand(true);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Terminal Header Bar */}
      <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Traffic light buttons */}
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="flex items-center space-x-2 pl-2">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              bash — yt-dlp & ffmpeg terminal
            </span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={openPythonModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
            title="View Python yt_dlp script"
          >
            <Code className="w-3 h-3 text-amber-400" />
            <span>Python Script</span>
          </button>

          <button
            type="button"
            onClick={() => copyToClipboard(bashSingle, 'bash')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
            title="Copy command to clipboard"
          >
            {copiedType === 'bash' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>Copy CLI</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLogs([])}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code preview block */}
      <div className="bg-zinc-900/40 p-3 border-b border-zinc-800/80">
        <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pb-1.5">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Generated Shell Command:
          </span>
          <button
            onClick={() => copyToClipboard(bashMulti, 'multi')}
            className="text-emerald-400 hover:underline text-[10px]"
          >
            {copiedType === 'multi' ? 'Copied multiline!' : 'Copy with line breaks (\\)'}
          </button>
        </div>
        <pre className="text-xs font-mono text-emerald-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 overflow-x-auto whitespace-pre-wrap select-all">
          {bashMulti}
        </pre>
      </div>

      {/* Terminal logs viewport */}
      <div className="p-4 font-mono text-xs text-zinc-300 min-h-[220px] max-h-[360px] overflow-y-auto space-y-1">
        {logs.map((log, index) => {
          const isError = log.includes('ERROR:') || log.includes('error');
          const isSuccess = log.includes('[✓]') || log.includes('Finished downloading');
          const isSponsor = log.includes('[SponsorBlock]');
          const isCommand = log.startsWith('user@linux:~$');

          let colorClass = 'text-zinc-300';
          if (isError) colorClass = 'text-red-400 font-semibold';
          else if (isSuccess) colorClass = 'text-emerald-400 font-semibold';
          else if (isSponsor) colorClass = 'text-amber-400 font-medium';
          else if (isCommand) colorClass = 'text-zinc-100 font-bold';

          return (
            <div key={index} className={`${colorClass} leading-relaxed`}>
              {log}
            </div>
          );
        })}
        {isExecuting && (
          <div className="text-emerald-400 flex items-center space-x-2 pt-1 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Processing stream pipeline & SponsorBlock filters...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal prompt input */}
      <form
        onSubmit={handleCommandSubmit}
        className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 flex items-center space-x-2"
      >
        <span className="text-emerald-400 font-mono text-xs font-bold select-none">
          user@linux:~$
        </span>
        <input
          type="text"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          placeholder="Type yt-dlp command, 'run', 'formats', 'version', or 'help'..."
          className="flex-1 bg-transparent text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
        >
          Enter
        </button>
      </form>

      {/* Execution Footer Bar */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-zinc-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Target:{' '}
            <strong className="text-zinc-200">
              {config.mediaType === 'audio'
                ? `Audio Only (${config.audioFormat.toUpperCase()})`
                : `Video (${config.videoQuality})`}
            </strong>
            {config.sponsorBlockAction !== 'none' && (
              <span className="text-amber-400 ml-1.5 font-medium">
                • SponsorBlock: {config.sponsorBlockAction}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={openAiModal}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            title="Open command line flags & syntax guide"
          >
            <TerminalIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Syntax Guide</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateExecution}
            disabled={isExecuting}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/80 transition-all cursor-pointer"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Pipeline & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
