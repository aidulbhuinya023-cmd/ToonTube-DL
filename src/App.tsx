import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from './firebase';
import {
  syncUserProfile,
  subscribeUserDownloads,
  addDownloadJob,
  removeDownloadJob,
  updateDownloadJobStatus,
  subscribeUserPresets,
  addPreset,
  removePreset,
} from './services/db';
import { DownloadJob, CliPreset, MediaInspectionResult } from './types';
import { Navbar } from './components/Navbar';
import { UrlInspector } from './components/UrlInspector';
import { SponsorBlockVisualizer } from './components/SponsorBlockVisualizer';
import { OptionsConfigurator, CliConfigState } from './components/OptionsConfigurator';
import { TerminalView } from './components/TerminalView';
import { PythonScriptModal } from './components/PythonScriptModal';
import { AiThinkingModal } from './components/AiThinkingModal';
import { DownloadsHistory } from './components/DownloadsHistory';
import { PresetsManager } from './components/PresetsManager';
import { ExtractorsCatalog } from './components/ExtractorsCatalog';

const DEFAULT_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'terminal' | 'downloads' | 'presets' | 'extractors'>('builder');
  
  // URL & Inspection state
  const [url, setUrl] = useState(DEFAULT_URL);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<MediaInspectionResult | null>(null);

  // Configuration State
  const [config, setConfig] = useState<CliConfigState>({
    mediaType: 'video',
    videoQuality: '1080p',
    audioFormat: 'mp3',
    audioQuality: '320k',
    embedSubs: true,
    writeSubs: true,
    subLangs: 'en,en-orig',
    convertSubs: 'srt',
    sponsorBlockAction: 'remove',
    sponsorBlockCategories: ['sponsor', 'selfpromo', 'intro', 'outro'],
    isPlaylist: false,
    playlistItems: '1-10',
    useArchive: true,
    embedThumbnail: true,
    addMetadata: true,
    rateLimit: '',
    outputTemplate: '%(title)s [%(id)s].%(ext)s',
    customArgs: '',
  });

  // Persistent Downloads and Presets
  const [downloads, setDownloads] = useState<DownloadJob[]>([]);
  const [presets, setPresets] = useState<CliPreset[]>([]);

  // Modals
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (e) {
          console.error('Error syncing profile:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user Firestore data when signed in
  useEffect(() => {
    if (!user) {
      // Provide local sample download for immediate interactivity
      if (downloads.length === 0) {
        setDownloads([
          {
            id: 'job_sample_1',
            userId: 'local',
            url: DEFAULT_URL,
            title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
            extractor: 'youtube',
            mediaType: 'video',
            quality: '1080p',
            subtitles: true,
            sponsorBlockAction: 'remove',
            sponsorBlockCategories: 'sponsor,selfpromo',
            status: 'completed',
            progress: 100,
            fileSize: '48.2 MB',
            downloadSpeed: '12.4 MiB/s',
            outputPath: 'Rick Astley - Never Gonna Give You Up.mp4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      return;
    }

    const unsubDownloads = subscribeUserDownloads(
      user.uid,
      (jobs) => setDownloads(jobs),
      (err) => console.error('Firestore downloads error:', err)
    );

    const unsubPresets = subscribeUserPresets(
      user.uid,
      (userPresets) => setPresets(userPresets),
      (err) => console.error('Firestore presets error:', err)
    );

    return () => {
      unsubDownloads?.();
      unsubPresets?.();
    };
  }, [user]);

  // Initial inspection on boot
  useEffect(() => {
    inspectUrl(DEFAULT_URL);
  }, []);

  const inspectUrl = async (targetUrl?: string) => {
    const toInspect = targetUrl || url;
    if (!toInspect) return;

    setIsInspecting(true);
    try {
      const res = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toInspect }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Inspection failed');
      setInspectionResult(data);
    } catch (err) {
      console.error('Inspection error:', err);
      // Fallback clean result so UI continues smoothly
      setInspectionResult({
        url: toInspect,
        id: 'generic_stream',
        title: 'Media Stream',
        author: 'Content Creator',
        thumbnail: '',
        duration: 300,
        extractor: 'generic',
        isPlaylist: false,
        sponsorSegments: [
          { category: 'sponsor', actionType: 'skip', segment: [35, 72] },
          { category: 'selfpromo', actionType: 'skip', segment: [140, 165] },
        ],
        formats: [
          { id: '137+140', resolution: '1080p (Full HD)', ext: 'mp4' },
          { id: '22', resolution: '720p (HD)', ext: 'mp4' },
        ],
        subtitles: [{ code: 'en', name: 'English', auto: false }],
      });
    } finally {
      setIsInspecting(false);
    }
  };

  // Job Execution & Save to Firestore
  const handleExecuteJob = async (jobData: Partial<DownloadJob>) => {
    const newJob: DownloadJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid || 'guest',
      url: jobData.url || url,
      title: jobData.title || inspectionResult?.title || 'Extracted Media',
      extractor: jobData.extractor || inspectionResult?.extractor || 'youtube',
      mediaType: jobData.mediaType || config.mediaType,
      quality: jobData.quality || config.videoQuality,
      audioFormat: jobData.audioFormat,
      subtitles: jobData.subtitles,
      subLangs: jobData.subLangs,
      sponsorBlockAction: jobData.sponsorBlockAction || config.sponsorBlockAction,
      sponsorBlockCategories: jobData.sponsorBlockCategories,
      cliCommand: jobData.cliCommand,
      status: jobData.status || 'completed',
      progress: jobData.progress || 100,
      fileSize: jobData.fileSize || '38 MB',
      downloadSpeed: jobData.downloadSpeed || '10 MiB/s',
      outputPath: jobData.outputPath,
      isPlaylist: jobData.isPlaylist || config.isPlaylist,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        await addDownloadJob(user.uid, newJob);
      } catch (err) {
        console.error('Failed to save to Firestore:', err);
      }
    } else {
      // Local state fallback
      setDownloads((prev) => [newJob, ...prev]);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (user) {
      try {
        await removeDownloadJob(user.uid, jobId);
      } catch (err) {
        console.error('Failed to delete job:', err);
      }
    } else {
      setDownloads((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  const handleRetryJob = async (job: DownloadJob) => {
    setUrl(job.url);
    await inspectUrl(job.url);
    setActiveTab('terminal');
  };

  // Presets operations
  const handleSavePreset = async (name: string, description: string) => {
    const newPreset: CliPreset = {
      id: `preset_${Date.now()}`,
      userId: user?.uid || 'guest',
      name,
      description,
      mediaType: config.mediaType,
      formatQuality: config.videoQuality,
      audioFormat: config.audioFormat,
      extractAudio: config.mediaType === 'audio',
      embedSubs: config.embedSubs,
      subLangs: config.subLangs,
      sponsorBlock: config.sponsorBlockCategories.join(','),
      extraArgs: config.customArgs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      await addPreset(user.uid, newPreset);
    } else {
      setPresets((prev) => [newPreset, ...prev]);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (user) {
      await removePreset(user.uid, presetId);
    } else {
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
    }
  };

  const handleApplyPreset = (preset: CliPreset) => {
    setConfig((prev) => ({
      ...prev,
      mediaType: preset.mediaType || 'video',
      videoQuality: preset.formatQuality || '1080p',
      audioFormat: preset.audioFormat || 'mp3',
      embedSubs: preset.embedSubs ?? true,
      subLangs: preset.subLangs || 'en,en-orig',
      sponsorBlockCategories: preset.sponsorBlock
        ? preset.sponsorBlock.split(',')
        : ['sponsor', 'selfpromo'],
      customArgs: preset.extraArgs || '',
    }));
    setActiveTab('builder');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        openAiModal={() => setIsAiModalOpen(true)}
        activeDownloadsCount={downloads.filter((d) => d.status === 'downloading').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Studio & Builder */}
        {activeTab === 'builder' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. URL Inspector */}
            <UrlInspector
              url={url}
              setUrl={setUrl}
              onInspect={inspectUrl}
              isLoading={isInspecting}
              result={inspectionResult}
            />

            {/* 2. SponsorBlock Visualizer */}
            <SponsorBlockVisualizer
              duration={inspectionResult?.duration || 300}
              segments={inspectionResult?.sponsorSegments || []}
              action={config.sponsorBlockAction}
              setAction={(action) => setConfig((prev) => ({ ...prev, sponsorBlockAction: action }))}
              selectedCategories={config.sponsorBlockCategories}
              setSelectedCategories={(cats) =>
                setConfig((prev) => ({ ...prev, sponsorBlockCategories: cats }))
              }
            />

            {/* 3. Ingestion & Format Options */}
            <OptionsConfigurator config={config} setConfig={setConfig} />

            {/* 4. Live Terminal Simulator */}
            <TerminalView
              url={url}
              config={config}
              inspection={inspectionResult}
              onExecuteJob={handleExecuteJob}
              openPythonModal={() => setIsPythonModalOpen(true)}
              openAiModal={() => setIsAiModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Interactive Terminal */}
        {activeTab === 'terminal' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Interactive CLI Shell & Execution Workspace
                </h2>
                <p className="text-xs text-zinc-400">
                  Target stream:{' '}
                  <span className="font-mono text-emerald-400">{url}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                Back to Options Builder
              </button>
            </div>
            <TerminalView
              url={url}
              config={config}
              inspection={inspectionResult}
              onExecuteJob={handleExecuteJob}
              openPythonModal={() => setIsPythonModalOpen(true)}
              openAiModal={() => setIsAiModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Downloads Queue & Cloud History */}
        {activeTab === 'downloads' && (
          <div className="space-y-6 animate-fade-in">
            <DownloadsHistory
              jobs={downloads}
              onDeleteJob={handleDeleteJob}
              onRetryJob={handleRetryJob}
              isSignedIn={!!user}
              onSignIn={signInWithGoogle}
            />
          </div>
        )}

        {/* Tab 4: Saved Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-6 animate-fade-in">
            <PresetsManager
              presets={presets}
              activeConfig={config}
              onApplyPreset={handleApplyPreset}
              onSavePreset={handleSavePreset}
              onDeletePreset={handleDeletePreset}
              isSignedIn={!!user}
              onSignIn={signInWithGoogle}
            />
          </div>
        )}

        {/* Tab 5: Supported Extractors (1,800+ sites) */}
        {activeTab === 'extractors' && (
          <div className="space-y-6 animate-fade-in">
            <ExtractorsCatalog />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-400 space-y-1.5">
        <p className="font-mono text-zinc-300 font-medium">
          ToonTube DL • Universal Media &amp; SponsorBlock Extractor • FFmpeg Postprocessing
        </p>
        <p className="text-zinc-400 text-xs flex items-center justify-center flex-wrap gap-2">
          <span>Free &amp; Open Source</span>
          <span className="text-zinc-700">•</span>
          <a
            href="https://apex-web-studio-india.web.app/frontend/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 hover:text-amber-400 font-medium transition-colors hover:underline"
            title="Apex Web Studio India"
          >
            Made by Apex Web Studio India
          </a>
          <span className="text-zinc-700">•</span>
          <span className="text-zinc-500 font-mono text-[11px]">MIT Licensed</span>
        </p>
      </footer>

      {/* Python Script Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        config={config}
        url={url}
      />

      {/* AI High-Thinking Modal */}
      <AiThinkingModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        config={config}
        url={url}
      />
    </div>
  );
}
