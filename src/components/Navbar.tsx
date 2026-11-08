import React from 'react';
import { 
  Search, 
  X, 
  Radio, 
  LayoutGrid, 
  List, 
  Heart, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { FilterQuality, ViewMode } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterQuality;
  onFilterChange: (filter: FilterQuality) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  favoritesCount: number;
  onToggleFavoritesDrawer: () => void;
  isFavoritesDrawerOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  favoritesCount,
  onToggleFavoritesDrawer,
  isFavoritesDrawerOpen
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <span className="text-lg">🐾</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                    MP3Paw <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Discovery</span>
                  </h1>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Embed v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  High-bitrate music discovery with in-app iframe player
                </p>
              </div>
            </div>

            {/* Mobile Favorites Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onToggleFavoritesDrawer}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                  isFavoritesDrawerOpen
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{favoritesCount}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-md lg:max-w-lg">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search song title, artist, 320kbps album..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Controls: View Mode & Favorites */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Quick Test Audio Button */}
            <button
              onClick={() => audioEngine.playTestChime()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all cursor-pointer shadow-sm"
              title="Test audio output on your speakers"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Test Sound</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Favorites Button */}
            <button
              onClick={onToggleFavoritesDrawer}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isFavoritesDrawerOpen
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <span>Saved</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                {favoritesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-0.5 no-scrollbar text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" /> Filter:
          </span>

          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            All Discoveries
          </button>

          <button
            onClick={() => onFilterChange('320kbps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === '320kbps'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>320 kbps Master</span>
            <span className="px-1 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-bold">
              HQ
            </span>
          </button>

          <button
            onClick={() => onFilterChange('trending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'trending'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Trending Hits</span>
          </button>

          <button
            onClick={() => onFilterChange('256kbps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              selectedFilter === '256kbps'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            256 kbps Standard
          </button>
        </div>
      </div>
    </header>
  );
};
