import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  Music, 
  Disc, 
  Volume2, 
  Play, 
  Pause, 
  Check, 
  Copy, 
  Info, 
  Headphones, 
  Radio, 
  FileAudio, 
  HardDrive, 
  Clock, 
  Sparkles,
  VolumeX
} from 'lucide-react';
import { Track } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface Mp3PawPreviewModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayDirect?: (track: Track) => void;
  isDirectPlaying?: boolean;
}

export const Mp3PawPreviewModal: React.FC<Mp3PawPreviewModalProps> = ({
  track,
  isOpen,
  onClose,
  onPlayDirect,
  isDirectPlaying = false
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [analyserBars, setAnalyserBars] = useState<number[]>([15, 35, 60, 85, 45, 70, 95, 50]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Subscribe to Audio Engine status
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((time, isPlaying) => {
      setCurrentTime(time);
      setIsPlayingAudio(isPlaying);

      // Sync state to embedded iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage({
            type: 'MP3PAW_SYNC_STATE',
            isPlaying,
            currentTime: time
          }, '*');
        } catch {
          // ignore
        }
      }
    });

    const status = audioEngine.getStatus();
    setIsPlayingAudio(status.isPlaying && status.track?.id === track?.id);
    setCurrentTime(status.currentTime);

    return () => {
      unsubscribe();
    };
  }, [track]);

  // Handle messages from inside the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MP3PAW_IFRAME_PLAY_TOGGLE') {
        if (track) {
          handleToggleAudio();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [track, isPlayingAudio]);

  // Animate audio analyzer visualizer when playing
  useEffect(() => {
    const updateAnalyser = () => {
      if (isPlayingAudio) {
        const data = audioEngine.getAnalyserData();
        if (data && data.length > 0) {
          const bars: number[] = [];
          const step = Math.floor(data.length / 8);
          for (let i = 0; i < 8; i++) {
            const val = data[i * step] || 0;
            bars.push(Math.max(12, Math.min(100, (val / 255) * 100)));
          }
          setAnalyserBars(bars);
        }
      } else {
        setAnalyserBars([15, 30, 45, 35, 60, 40, 50, 25]);
      }
      animFrameRef.current = requestAnimationFrame(updateAnalyser);
    };

    animFrameRef.current = requestAnimationFrame(updateAnalyser);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingAudio]);

  // Reset states on track change
  useEffect(() => {
    if (track) {
      setIframeLoaded(false);
      const status = audioEngine.getStatus();
      if (status.track?.id === track.id) {
        setIsPlayingAudio(status.isPlaying);
        setCurrentTime(status.currentTime);
      } else {
        setIsPlayingAudio(false);
        setCurrentTime(0);
      }
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      audioEngine.pause();
      setIsPlayingAudio(false);
    } else {
      audioEngine.playTrack(track);
      setIsPlayingAudio(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    audioEngine.setVolume(newVol / 100);
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

  const handleCopyProviderLink = () => {
    try {
      navigator.clipboard.writeText(track.providerUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentTime / (track.durationSeconds || 210)) * 100);

  // Embedded HTML player for iframe (with communication back to real audio engine)
  const playerIframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script>
        window.onerror = function() { return true; };
      </script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: linear-gradient(135deg, #090d16 0%, #151b30 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12px;
          overflow: hidden;
        }
        .container {
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
        }
        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #2563eb;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 3px 7px;
          border-radius: 5px;
        }
        .stream-status {
          font-size: 10px;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
        }
        .stream-dot {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 6px #10b981;
        }
        .track-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .art-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .meta-text {
          overflow: hidden;
          flex: 1;
        }
        .track-title {
          font-size: 13px;
          font-weight: 700;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .track-artist {
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
        .progress-box {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .progress-bar-bg {
          width: 100%;
          height: 5px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 9999px;
          transition: width 0.2s linear;
        }
        .time-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
          font-family: monospace;
        }
        .eq-bars {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 18px;
        }
        .bar {
          width: 3px;
          background: #60a5fa;
          border-radius: 2px;
          height: 25%;
        }
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2px;
        }
        .btn-play {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border: none;
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        .bitrate-pill {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="top-row">
          <div class="brand-badge">🐾 MP3PAW STREAM</div>
          <div class="stream-status">
            <span class="stream-dot"></span> 320 KBPS MASTER
          </div>
        </div>
        <div class="track-info">
          <img src="${track.artwork}" alt="${track.title.replace(/"/g, '&quot;')}" class="art-thumb" />
          <div class="meta-text">
            <div class="track-title">${track.title.replace(/</g, '&lt;')}</div>
            <div class="track-artist">${track.artist.replace(/</g, '&lt;')} • ${track.album.replace(/</g, '&lt;')}</div>
          </div>
          <div class="eq-bars">
            <div class="bar" style="height: 30%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 90%"></div>
            <div class="bar" style="height: 70%"></div>
            <div class="bar" style="height: 85%"></div>
            <div class="bar" style="height: 50%"></div>
          </div>
        </div>
        <div class="progress-box">
          <div class="progress-bar-bg">
            <div id="prog-fill" class="progress-bar-fill"></div>
          </div>
          <div class="time-row">
            <span id="cur-time">00:00</span>
            <span>${track.duration}</span>
          </div>
        </div>
        <div class="controls-row">
          <div class="bitrate-pill">MP3 • ${track.bitrate} • ${track.fileSize}</div>
          <button id="play-btn" class="btn-play" onclick="triggerToggle()">▶</button>
        </div>
      </div>
      <script>
        function triggerToggle() {
          try {
            window.parent.postMessage({ type: 'MP3PAW_IFRAME_PLAY_TOGGLE' }, '*');
          } catch(e) {}
        }
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'MP3PAW_SYNC_STATE') {
            var btn = document.getElementById('play-btn');
            if (btn) btn.textContent = e.data.isPlaying ? '❚❚' : '▶';
            var curTime = document.getElementById('cur-time');
            if (curTime && e.data.currentTime !== undefined) {
              var s = Math.floor(e.data.currentTime);
              var min = Math.floor(s / 60);
              var sec = s % 60;
              curTime.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
            }
            var fill = document.getElementById('prog-fill');
            if (fill && e.data.currentTime !== undefined) {
              var total = ${track.durationSeconds || 210};
              var pct = Math.min(100, (e.data.currentTime / total) * 100);
              fill.style.width = pct + '%';
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mp3paw-preview-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/40 overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Radio className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-emerald-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-400">
                  MP3Paw Discovery
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                  isPlayingAudio
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {isPlayingAudio ? '● Streaming Audio' : 'In-App Preview'}
                </span>
              </div>
              <h2 id="mp3paw-preview-title" className="text-sm font-semibold text-slate-200">
                Embedded Audio Player
              </h2>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            onClick={onClose}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title="Close Preview Modal (Esc)"
            aria-label="Close MP3Paw preview"
          >
            <span>Close</span>
            <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto px-5 py-5 space-y-5">
          {/* Track Artwork and Rich Metadata Card */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            {/* Artwork thumbnail with audio indicator glow */}
            <div className="relative group mx-auto sm:mx-0 shrink-0">
              <img
                src={track.artwork}
                alt={`${track.title} by ${track.artist}`}
                className={`w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl shadow-lg border transition-all duration-300 ${
                  isPlayingAudio ? 'border-blue-400 ring-2 ring-blue-500/40' : 'border-slate-700/70'
                }`}
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-300 border border-white/10">
                {track.bitrate}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-200 border border-white/10 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                {track.duration}
              </div>

              {/* Play Overlay On Thumbnail */}
              <button
                onClick={handleToggleAudio}
                className="absolute inset-0 bg-black/40 hover:bg-black/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center transition-opacity cursor-pointer group-hover:opacity-100"
                title={isPlayingAudio ? 'Pause Audio' : 'Play Audio'}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transform transition-transform group-hover:scale-110">
                  {isPlayingAudio ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </div>
              </button>
            </div>

            {/* Metadata Information */}
            <div className="flex-1 min-w-0 flex flex-col justify-between text-center sm:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {track.genre}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-700/60 text-slate-300">
                    {track.year}
                  </span>
                  {track.isPopular && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Popular
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug truncate">
                  {track.title}
                </h3>
                <p className="text-sm font-medium text-slate-300 truncate mt-0.5">
                  {track.artist}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  Album: {track.album}
                </p>
              </div>

              {/* Direct Play Action Bar with Live Equalizer Visualizer */}
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAudio}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Play Audio Now</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => audioEngine.playTestChime()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    title="Play 3-note chime to test your device speakers"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Test Sound</span>
                  </button>
                </div>

                {/* Live Audio Equalizer Bars */}
                <div className="flex items-end gap-1 h-6 px-2.5 py-1 bg-slate-900/80 rounded-lg border border-slate-700/60">
                  {analyserBars.map((barHeight, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 rounded-t bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-75"
                      style={{ height: `${barHeight}%` }}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-slate-300 ml-1.5">
                    {formatTime(currentTime)} / {track.duration}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Pills */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>Size: <strong className="text-white">{track.fileSize}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Quality: <strong className="text-emerald-400">{track.bitrate}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-purple-400" />
                  <span>Streams: <span className="text-slate-200">{track.plays}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* MP3Paw Embedded Player Iframe Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-blue-400" />
                MP3Paw Iframe Player (Embedded)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                loading="lazy" • Interactive Stream
              </span>
            </div>

            {/* The required iframe container with loading='lazy' */}
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner group">
              <iframe
                ref={iframeRef}
                srcDoc={playerIframeHtml}
                title={`MP3Paw embedded player for ${track.title}`}
                loading="lazy"
                allow="autoplay; encrypted-media; fullscreen"
                sandbox="allow-scripts allow-presentation allow-forms"
                className="w-full h-52 sm:h-56 border-0 block"
                onLoad={() => setIframeLoaded(true)}
              />

              {/* Loading overlay if iframe takes a moment */}
              {!iframeLoaded && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Initializing MP3Paw embedded stream...</span>
                </div>
              )}
            </div>
          </div>

          {/* In-Modal Volume Control Slider */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="text-slate-400 hover:text-white cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-400" />
                )}
              </button>
              <span className="text-slate-300 font-medium">Output Volume:</span>
              <span className="font-mono text-slate-400">{isMuted ? '0%' : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Provider Notice & Direct Fallback Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200/90 leading-relaxed">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-100">
                Playing in-app via the MP3Paw embedded audio engine.
              </p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                The embedded player runs directly inside this window without navigating away or opening popups. You can also use the Open Provider button below to visit MP3Paw directly.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer with Clear 'Open Provider' fallback and 'Close' button */}
        <div className="px-5 py-4 bg-slate-800/80 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick link copy & details */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyProviderLink}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Copy direct MP3Paw URL"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Source: mp3paw.cool
            </span>
          </div>

          {/* Primary Buttons: Open Provider Fallback & Close */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Clear Close Button in footer */}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-semibold cursor-pointer"
            >
              Close
            </button>

            {/* Clear 'Open Provider' Fallback Button */}
            <a
              href={track.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Open the original MP3Paw provider page in a new tab"
            >
              <span>Open Provider</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
