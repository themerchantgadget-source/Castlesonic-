import React from 'react';
import { X, Heart, Radio, ExternalLink, Trash2 } from 'lucide-react';
import { Track } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Track[];
  onPreview: (track: Track) => void;
  onRemoveFavorite: (track: Track) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onPreview,
  onRemoveFavorite
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="text-base font-bold text-white">Saved Tracks</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
                {favorites.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Heart className="w-10 h-10 stroke-[1.5] mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No saved tracks yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the heart icon on any MP3Paw discovery result to save it here for fast in-app previewing.
                </p>
              </div>
            ) : (
              favorites.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  <img
                    src={track.artwork}
                    alt={track.title}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-700/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 
                      onClick={() => onPreview(track)}
                      className="text-xs font-bold text-slate-100 hover:text-blue-400 truncate cursor-pointer"
                    >
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>{track.bitrate}</span>
                      <span>•</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onPreview(track)}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                      title="Open in-app MP3Paw preview"
                    >
                      <Radio className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(track)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
