import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Radio, 
  ExternalLink, 
  Repeat, 
  Shuffle 
} from 'lucide-react';
import { Track } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onOpenPreviewModal: (track: Track) => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onOpenPreviewModal
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [eqBars, setEqBars] = useState<number[]>([20, 45, 75, 50, 90, 65]);

  const animFrameRef = useRef<number | null>(null);

  // Subscribe to real audio engine updates
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((time, enginePlaying) => {
      setCurrentTime(time);
    });

    const status = audioEngine.getStatus();
    setCurrentTime(status.currentTime);

    return () => {
      unsubscribe();
    };
  }, []);

  // Equalizer visualizer loop
  useEffect(() => {
    const renderVisualizer = () => {
      if (isPlaying) {
        const data = audioEngine.getAnalyserData();
        if (data && data.length > 0) {
          const bars: number[] = [];
          const step = Math.floor(data.length / 6);
          for (let i = 0; i < 6; i++) {
            const val = data[i * step] || 0;
            bars.push(Math.max(15, Math.min(100, (val / 255) * 100)));
          }
          setEqBars(bars);
        }
      } else {
        setEqBars([15, 25, 35, 25, 30, 20]);
      }
      animFrameRef.current = requestAnimationFrame(renderVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(renderVisualizer);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  if (!currentTrack) return null;

  const duration = currentTrack.durationSeconds || 210;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * duration;
    setCurrentTime(targetSeconds);
    audioEngine.seek(targetSeconds);
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    setIsMuted(newVal === 0);
    audioEngine.setVolume(newVal / 100);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume / 100);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Track Info */}
        <div className="flex items-center gap-3 w-full sm:w-1/3 min-w-0">
          <div 
            onClick={() => onOpenPreviewModal(currentTrack)}
            className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-700/60 cursor-pointer group shadow"
          >
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Radio className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 
                onClick={() => onOpenPreviewModal(currentTrack)}
                className="text-xs sm:text-sm font-bold text-white truncate hover:text-blue-400 cursor-pointer"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                {currentTrack.bitrate}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Dedicated "Open MP3Paw Preview Modal" Button */}
          <button
            onClick={() => onOpenPreviewModal(currentTrack)}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/40 text-[11px] font-semibold transition-all shrink-0 cursor-pointer"
            title="Open in-app MP3Paw preview modal with embedded iframe"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Embed Modal</span>
          </button>
        </div>

        {/* Center Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:w-1/2 max-w-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isShuffle ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPrevious}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer text-white ${
                isPlaying
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isRepeat ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* EQ Bars Indicator */}
            <div className="hidden lg:flex items-end gap-0.5 h-4 ml-1">
              {eqBars.map((val, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-blue-400 rounded-t"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full flex items-center gap-2.5 text-[10px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <div 
              className="relative flex-1 h-1.5 bg-slate-800 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full group-hover:from-blue-400 group-hover:to-indigo-400"
                style={{ width: `${progressPercent}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Right Controls: Volume & Provider Fallback */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-1/3">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-18 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Test Sound Chime Button */}
          <button
            onClick={() => audioEngine.playTestChime()}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
            title="Play test chime through speakers"
          >
            <Volume2 className="w-3 h-3 text-indigo-400" />
            <span>Test Sound</span>
          </button>

          {/* Quick Fallback to Provider */}
          <a
            href={currentTrack.providerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open Provider source (MP3Paw)"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
