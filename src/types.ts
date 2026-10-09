export interface FormatOption {
  id: string;
  resolution: string;
  ext: string;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  note?: string;
  filesizeApprox?: string;
}

export interface SubtitleTrack {
  code: string;
  name: string;
  auto: boolean;
}

export interface SponsorSegment {
  category: 'sponsor' | 'selfpromo' | 'interaction' | 'intro' | 'outro' | 'preview' | 'music_offtopic' | string;
  actionType: 'skip' | 'mute' | 'full';
  segment: [number, number];
  UUID?: string;
}

export interface MediaInspectionResult {
  url: string;
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  extractor: string;
  isPlaylist: boolean;
  sponsorSegments: SponsorSegment[];
  formats: FormatOption[];
  subtitles: SubtitleTrack[];
}

export interface DownloadJob {
  id: string;
  userId: string;
  url: string;
  title: string;
  extractor?: string;
  mediaType: 'video' | 'audio';
  formatSelection?: string;
  quality?: string;
  audioFormat?: 'mp3' | 'm4a' | 'flac' | 'opus' | 'wav' | 'none';
  subtitles?: boolean;
  subLangs?: string;
  sponsorBlockAction?: 'none' | 'remove' | 'mark';
  sponsorBlockCategories?: string;
  cliCommand?: string;
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'error';
  progress?: number;
  fileSize?: string;
  downloadSpeed?: string;
  eta?: string;
  outputPath?: string;
  isPlaylist?: boolean;
  playlistCount?: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CliPreset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  mediaType?: 'video' | 'audio';
  formatQuality?: string;
  audioFormat?: string;
  extractAudio?: boolean;
  embedSubs?: boolean;
  subLangs?: string;
  sponsorBlock?: string;
  extraArgs?: string;
  createdAt: string;
  updatedAt: string;
}
