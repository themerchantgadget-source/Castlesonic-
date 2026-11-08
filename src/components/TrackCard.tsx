import React from 'react';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Heart, 
  Headphones, 
  HardDrive, 
  Clock, 
  Maximize2,
  Radio,
  Sparkles
} from 'lucide-react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isFavorite: boolean;
  onPreview: (track: Track) => void;
  onPlayDirect: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isFavorite,
  onPreview,
  onPlayDirect,
  onToggleFavorite
}) => {
  return (
    <div className="group relative flex flex-col bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-blue-950/20">
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3.5 shadow-md">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quality Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/75 backdrop-blur-md text-blue-300 border border-white/10">
            {track.bitrate}
          </span>
          {track.isPopular && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/80 text-black flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> HOT
            </span>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/75 backdrop-blur-md text-slate-300 border border-white/10 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {track.duration}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(track);
          }}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/90 text-white shadow-md'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Centered Hover Quick-Preview & Play Trigger overlay */}
        <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayDirect(track);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-90 cursor-pointer text-white ${
              isPlaying
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40 ring-2 ring-emerald-400/40'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/40'
            }`}
            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(track);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-[11px] shadow border border-slate-700/80 transition-colors cursor-pointer"
            title="Open In-App MP3Paw Preview Modal"
          >
            <Radio className="w-3 h-3 text-blue-400" />
            <span>Preview Modal</span>
          </button>
        </div>
      </div>

      {/* Metadata info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="truncate max-w-[70%] font-medium text-blue-400/90">
              {track.genre}
            </span>
            <span>{track.year}</span>
          </div>

          <h3 
            onClick={() => onPreview(track)}
            className="text-sm font-bold text-slate-100 hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer"
            title={track.title}
          >
            {track.title}
          </h3>

          <p className="text-xs text-slate-400 truncate mt-0.5">
            {track.artist}
          </p>
        </div>

        {/* Audio Specs Info */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-slate-300">
            <HardDrive className="w-3 h-3 text-slate-500" />
            <span>{track.fileSize}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Headphones className="w-3 h-3 text-slate-500" />
            <span>{track.plays}</span>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-1">
          {/* Main Action: In-App Preview Modal */}
          <button
            onClick={() => onPreview(track)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-colors text-xs font-semibold cursor-pointer"
            title="Open in-app preview modal with embedded iframe"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          {/* Fallback Action: Open Provider */}
          <a
            href={track.providerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 transition-colors text-xs font-medium cursor-pointer"
            title="Open original MP3Paw source page in new tab"
          >
            <span>Provider</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
