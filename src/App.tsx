import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Sparkles, 
  Flame, 
  Search, 
  ExternalLink, 
  Headphones, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Music2, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Track, FilterQuality, ViewMode } from './types';
import { DISCOVERY_TRACKS, POPULAR_SEARCH_TAGS } from './data/mockTracks';
import { Navbar } from './components/Navbar';
import { TrackCard } from './components/TrackCard';
import { TrackListItem } from './components/TrackListItem';
import { Mp3PawPreviewModal } from './components/Mp3PawPreviewModal';
import { BottomPlayer } from './components/BottomPlayer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [tracks] = useState<Track[]>(DISCOVERY_TRACKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterQuality>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // In-App Preview Modal State
  const [previewTrack, setPreviewTrack] = useState<Track | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Persistent Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DISCOVERY_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<Track[]>([DISCOVERY_TRACKS[0], DISCOVERY_TRACKS[1]]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Subscribe to real audio engine
  React.useEffect(() => {
    const unsubscribe = audioEngine.subscribe((time, enginePlaying) => {
      setIsPlaying(enginePlaying);
      const status = audioEngine.getStatus();
      if (status.track) {
        setCurrentTrack(status.track);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      // Search filter
      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.genre.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Quality / Category filter
      if (selectedFilter === '320kbps') return track.bitrate === '320kbps';
      if (selectedFilter === '256kbps') return track.bitrate === '256kbps';
      if (selectedFilter === 'trending') return !!track.isPopular;

      return true;
    });
  }, [tracks, searchQuery, selectedFilter]);

  // Handlers
  const handleOpenPreview = (track: Track) => {
    setPreviewTrack(track);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePlayDirect = (track: Track) => {
    setCurrentTrack(track);
    audioEngine.togglePlay(track);
  };

  const handleToggleFavorite = (track: Track) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      } else {
        return [...prev, track];
      }
    });
  };

  const handleNextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    setCurrentTrack(nextTrack);
    audioEngine.playTrack(nextTrack);
  };

  const handlePreviousTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIndex];
    setCurrentTrack(prevTrack);
    audioEngine.playTrack(prevTrack);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        favoritesCount={favorites.length}
        onToggleFavoritesDrawer={() => setIsFavoritesOpen(true)}
        isFavoritesDrawerOpen={isFavoritesOpen}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full flex-1">
        {/* Hero Discovery Announcement Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-900/40 p-5 sm:p-7 mb-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                <span>Feature Active: In-App Embedded Player Previews</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Stream MP3Paw Discovery Tracks Directly In-App
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Click any discovery result to launch the high-fidelity in-app preview modal. Equipped with a lazy-loaded MP3Paw iframe embed player, full artwork metadata, quick Close controls, and an Open Provider fallback.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lazy-Loaded Iframe</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Complete Artwork & Specs</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Direct Provider Fallback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Trending queries:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors shrink-0 cursor-pointer text-xs"
            >
              {tag}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2 py-1 rounded-lg text-blue-400 hover:text-blue-300 underline font-medium shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Discovery Results
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
              {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'}
            </span>
            {searchQuery && (
              <span className="text-xs text-slate-400">
                for "{searchQuery}"
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Click <strong className="text-blue-400">Preview</strong> on any track to open the embedded player modal
          </div>
        </div>

        {/* Tracks Content (Grid or List) */}
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-200">No matching tracks found</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              We couldn't find any MP3Paw discovery tracks matching "{searchQuery}". Try searching for another artist or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                isFavorite={favorites.some((f) => f.id === track.id)}
                onPreview={handleOpenPreview}
                onPlayDirect={handlePlayDirect}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track, idx) => (
              <TrackListItem
                key={track.id}
                track={track}
                index={idx}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                isFavorite={favorites.some((f) => f.id === track.id)}
                onPreview={handleOpenPreview}
                onPlayDirect={handlePlayDirect}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* The Requested In-App Preview Modal with MP3Paw Embedded Iframe Player */}
      <Mp3PawPreviewModal
        track={previewTrack}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onPlayDirect={handlePlayDirect}
        isDirectPlaying={isPlaying && currentTrack?.id === previewTrack?.id}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onPreview={(track) => {
          setIsFavoritesOpen(false);
          handleOpenPreview(track);
        }}
        onRemoveFavorite={handleToggleFavorite}
      />

      {/* Persistent Bottom Audio Player Bar */}
      <BottomPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => audioEngine.togglePlay(currentTrack || DISCOVERY_TRACKS[0])}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onOpenPreviewModal={handleOpenPreview}
      />
    </div>
  );
}
