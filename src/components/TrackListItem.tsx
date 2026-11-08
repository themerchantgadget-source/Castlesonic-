import React from 'react';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Heart, 
  Radio, 
  Clock, 
  HardDrive, 
  Headphones 
} from 'lucide-react';
import { Track } from '../types';

interface TrackListItemProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  isFavorite: boolean;
  onPreview: (track: Track) => void;
  onPlayDirect: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  index,
  isPlaying,
  isFavorite,
  onPreview,
  onPlayDirect,
  onToggleFavorite
}) => {
  return (
    <div className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/70 hover:border-slate-700/80 transition-all duration-150">
      {/* Left: Track Index / Play icon & Artwork */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => onPlayDirect(track)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isPlaying
              ? 'bg-emerald-500 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isPlaying ? 'Pause Audio' : 'Play Audio'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Thumbnail with overlay preview button */}
        <div 
          onClick={() => onPreview(track)}
          className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950 cursor-pointer shadow border border-slate-700/50"
        >
          <img
            src={track.artwork}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Title, Artist, and Tags */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span 
              onClick={() => onPreview(track)}
              className="text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors truncate cursor-pointer"
              title={track.title}
            >
              {track.title}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
              {track.bitrate}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-0.5">
            <span className="truncate">{track.artist}</span>
            <span>•</span>
            <span className="truncate text-slate-500 hidden sm:inline">{track.album}</span>
          </div>
        </div>
      </div>

      {/* Middle Specs (File size, Duration, Stream count) */}
      <div className="hidden md:flex items-center gap-5 text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-1">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>{track.fileSize}</span>
        </div>
        <div className="flex items-center gap-1">
          <Headphones className="w-3.5 h-3.5 text-slate-500" />
          <span>{track.plays}</span>
        </div>
        <div className="flex items-center gap-1 w-14 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{track.duration}</span>
        </div>
      </div>

      {/* Right Actions: In-App Preview, Open Provider, Favorite */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleFavorite(track)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isFavorite
              ? 'text-rose-500 hover:bg-rose-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Primary Action: In-App Preview Modal */}
        <button
          onClick={() => onPreview(track)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
          title="Open MP3Paw in-app embedded player modal"
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">In-App Preview</span>
          <span className="sm:hidden">Preview</span>
        </button>

        {/* Fallback Action: Open Provider */}
        <a
          href={track.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          title="Open original MP3Paw page in new tab"
        >
          <span className="hidden lg:inline">Provider</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </div>
  );
};
