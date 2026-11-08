export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: string;
  durationSeconds: number;
  bitrate: '320kbps' | '256kbps' | '192kbps' | '128kbps';
  fileSize: string;
  genre: string;
  year: number;
  plays: string;
  downloads: string;
  providerUrl: string;
  embedUrl: string;
  audioUrl?: string;
  tags: string[];
  isPopular?: boolean;
}

export type ViewMode = 'grid' | 'list';
export type FilterQuality = 'all' | '320kbps' | '256kbps' | 'trending' | 'lossless';
