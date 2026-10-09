import React from 'react';
import {
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Copy,
  FileVideo,
  Music,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { DownloadJob } from '../types';

interface DownloadsHistoryProps {
  jobs: DownloadJob[];
  onDeleteJob: (id: string) => Promise<void>;
  onRetryJob: (job: DownloadJob) => Promise<void>;
  isSignedIn: boolean;
  onSignIn: () => void;
}

export const DownloadsHistory: React.FC<DownloadsHistoryProps> = ({
  jobs,
  onDeleteJob,
  onRetryJob,
  isSignedIn,
  onSignIn,
}) => {
  const handleDownloadFile = (job: DownloadJob) => {
    // Generate a downloadable media placeholder blob
    const content = `yt-dlp Media Ingestion Export\nTitle: ${job.title}\nURL: ${job.url}\nQuality: ${job.quality}\nFormat: ${job.mediaType}\nSponsorBlock: ${job.sponsorBlockAction}\nCommand: ${job.cliCommand}\nTimestamp: ${job.createdAt}`;
    const mime = job.mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4';
    const blob = new Blob([content], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = job.outputPath || `${job.title || 'media'}.${job.mediaType === 'audio' ? 'mp3' : 'mp4'}`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const copyCommand = (cmd?: string) => {
    if (cmd) {
      navigator.clipboard.writeText(cmd);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-zinc-100">
              Download Queue & Cloud History
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              {jobs.length} items
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Manage your recent downloads, completed files, and command history
          </p>
        </div>

        {!isSignedIn && (
          <div className="flex items-center space-x-2 text-xs bg-amber-950/40 border border-amber-800/60 p-2 rounded-lg text-amber-300">
            <span>Sign in to persist your jobs across devices!</span>
            <button
              onClick={onSignIn}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded text-[11px] transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto">
            <Download className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-300 font-medium">No active or completed downloads</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Configure your download options in the Studio and click "Run Pipeline & Download" to process media.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const isCompleted = job.status === 'completed';
            const isDownloading = job.status === 'downloading';
            const isError = job.status === 'error';

            return (
              <div
                key={job.id}
                className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        job.mediaType === 'audio'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-800/60'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {job.mediaType === 'audio' ? (
                        <Music className="w-4 h-4" />
                      ) : (
                        <FileVideo className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-zinc-100 truncate" title={job.title}>
                          {job.title}
                        </h4>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                            isCompleted
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                              : isDownloading
                              ? 'bg-blue-950 text-blue-400 border border-blue-800/80 animate-pulse'
                              : isError
                              ? 'bg-red-950 text-red-400 border border-red-800/80'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {job.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-400">
                        <span className="font-mono text-zinc-300">{job.quality || 'Standard'}</span>
                        <span>•</span>
                        <span>{job.fileSize || '48 MB'}</span>
                        {job.sponsorBlockAction && job.sponsorBlockAction !== 'none' && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>SponsorBlock {job.sponsorBlockAction}</span>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {new Date(job.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {job.cliCommand && (
                      <button
                        onClick={() => copyCommand(job.cliCommand)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        title="Copy CLI command used"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => handleDownloadFile(job)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save File</span>
                      </button>
                    )}

                    {isError && (
                      <button
                        onClick={() => onRetryJob(job)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {isDownloading && (
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${job.progress || 45}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
