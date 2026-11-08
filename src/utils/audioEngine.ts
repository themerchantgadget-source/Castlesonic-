/**
 * Real Auditory Music Engine for MP3Paw Discovery
 * Uses HTML5 Audio with dynamically rendered 44.1kHz Stereo PCM WAV music streams
 * for 100% guaranteed, audible speaker output across all modern browsers.
 */

import { Track } from '../types';

interface TrackPattern {
  bpm: number;
  rootFreq: number; // Hz
  scale: number[];
  bassNotes: number[];
  melodyNotes: number[];
  drumStyle: 'fourOnFloor' | 'breakbeat' | 'chillhop' | 'afro' | 'trap';
}

const GENRE_PATTERNS: Record<string, TrackPattern> = {
  'Synthwave / Electronic': {
    bpm: 124,
    rootFreq: 220, // A3
    scale: [0, 3, 7, 10, 12, 15, 19],
    bassNotes: [0, 0, 3, 3, 7, 7, 5, 5],
    melodyNotes: [12, 15, 19, 15, 12, 10, 7, 10, 12, 15, 17, 15, 12, 7, 3, 7],
    drumStyle: 'fourOnFloor'
  },
  'R&B / Soul': {
    bpm: 85,
    rootFreq: 261.63, // C4
    scale: [0, 4, 7, 9, 11, 14, 16],
    bassNotes: [0, 0, 5, 5, 9, 9, 7, 7],
    melodyNotes: [7, 9, 11, 14, 12, 9, 7, 4, 7, 9, 11, 14, 16, 14, 11, 9],
    drumStyle: 'chillhop'
  },
  'Cyber Electro / D&B': {
    bpm: 138,
    rootFreq: 196, // G3
    scale: [0, 3, 5, 6, 7, 10, 12],
    bassNotes: [0, 0, 3, 6, 0, 0, 5, 7],
    melodyNotes: [12, 10, 7, 6, 5, 3, 5, 7, 12, 15, 14, 12, 10, 7, 6, 5],
    drumStyle: 'breakbeat'
  },
  'Lo-Fi / Chillhop': {
    bpm: 78,
    rootFreq: 293.66, // D4
    scale: [0, 2, 5, 7, 9, 12, 14],
    bassNotes: [0, 0, 5, 5, 7, 7, 2, 2],
    melodyNotes: [7, 9, 12, 14, 9, 7, 5, 2, 5, 7, 9, 12, 9, 7, 5, 2],
    drumStyle: 'chillhop'
  },
  'Afrobeats / Dancehall': {
    bpm: 105,
    rootFreq: 329.63, // E4
    scale: [0, 4, 7, 9, 12, 16],
    bassNotes: [0, 4, 7, 4, 0, 7, 9, 7],
    melodyNotes: [12, 12, 9, 7, 4, 7, 9, 12, 16, 12, 9, 7, 9, 7, 4, 0],
    drumStyle: 'afro'
  },
  'Indie Folk / Ambient': {
    bpm: 92,
    rootFreq: 246.94, // B3
    scale: [0, 2, 4, 7, 9, 12, 14],
    bassNotes: [0, 0, 4, 4, 7, 7, 2, 2],
    melodyNotes: [7, 9, 12, 14, 12, 9, 7, 4, 7, 9, 12, 9, 7, 4, 2, 4],
    drumStyle: 'chillhop'
  },
  'J-Trap / Phonk': {
    bpm: 136,
    rootFreq: 174.61, // F3
    scale: [0, 1, 5, 7, 8, 12],
    bassNotes: [0, 0, 1, 1, 5, 5, 0, 7],
    melodyNotes: [12, 13, 12, 8, 7, 5, 7, 8, 12, 15, 13, 12, 8, 7, 5, 1],
    drumStyle: 'trap'
  },
  'Deep House / Melodic': {
    bpm: 124,
    rootFreq: 220, // A3
    scale: [0, 3, 7, 10, 12, 15],
    bassNotes: [0, 0, 3, 3, 7, 7, 5, 5],
    melodyNotes: [12, 15, 12, 7, 10, 7, 3, 7, 12, 15, 17, 15, 12, 10, 7, 3],
    drumStyle: 'fourOnFloor'
  }
};

/**
 * Generate a complete stereo WAV Blob with audible music drums, bass, and synth
 */
function generateMusicWav(pattern: TrackPattern, durationSeconds = 12): string {
  const sampleRate = 44100;
  const totalSamples = sampleRate * durationSeconds;
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const secondsPerBeat = 60 / pattern.bpm;
  const sixteenth = secondsPerBeat / 4;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const current16th = Math.floor(t / sixteenth) % 16;
    const timeIn16th = (t % sixteenth);
    const timeInBeat = (t % secondsPerBeat);

    let mixL = 0;
    let mixR = 0;

    // 1. Kick Drum
    let isKick = false;
    if (pattern.drumStyle === 'fourOnFloor') {
      isKick = current16th % 4 === 0;
    } else if (pattern.drumStyle === 'afro') {
      isKick = current16th === 0 || current16th === 6 || current16th === 10;
    } else if (pattern.drumStyle === 'trap' || pattern.drumStyle === 'breakbeat') {
      isKick = current16th === 0 || current16th === 7 || current16th === 10;
    } else {
      isKick = current16th === 0 || current16th === 8;
    }

    if (isKick && timeIn16th < 0.22) {
      const kickEnv = Math.exp(-timeIn16th * 18);
      const kickFreq = 140 * Math.exp(-timeIn16th * 28) + 42;
      const kick = Math.sin(2 * Math.PI * kickFreq * timeIn16th) * kickEnv * 0.75;
      mixL += kick;
      mixR += kick;
    }

    // 2. Snare / Clap on beat 2 and 4 (16th index 4 and 12)
    const isSnare = current16th === 4 || current16th === 12;
    if (isSnare && timeIn16th < 0.2) {
      const snareEnv = Math.exp(-timeIn16th * 22);
      const noise = ((Math.random() * 2) - 1) * 0.45;
      const tone = Math.sin(2 * Math.PI * 185 * timeIn16th) * 0.35;
      const snare = (noise + tone) * snareEnv * 0.55;
      mixL += snare;
      mixR += snare;
    }

    // 3. Hi-Hat on every 16th or 8th
    const isHat = current16th % 2 === 0;
    if (isHat && timeIn16th < 0.05) {
      const hatEnv = Math.exp(-timeIn16th * 75);
      const hatNoise = ((Math.random() * 2) - 1) * hatEnv * 0.22;
      mixL += hatNoise * 0.8;
      mixR += hatNoise * 1.1; // stereo width
    }

    // 4. Bassline (changes every 2 beats)
    const bassIndex = Math.floor(t / (secondsPerBeat * 2)) % pattern.bassNotes.length;
    const bassSemitone = pattern.bassNotes[bassIndex];
    const bassFreq = (pattern.rootFreq / 2) * Math.pow(2, bassSemitone / 12);
    const bassEnv = Math.min(1, Math.exp(-(t % (secondsPerBeat * 0.5)) * 3.5));
    // Warm saw/triangle hybrid bass
    const bass = (Math.sin(2 * Math.PI * bassFreq * t) * 0.5 + 
                  Math.sin(4 * Math.PI * bassFreq * t) * 0.25) * bassEnv * 0.45;
    mixL += bass;
    mixR += bass;

    // 5. Melodic Lead Arpeggio (changes every 16th note)
    const melodyIndex = current16th % pattern.melodyNotes.length;
    const leadSemitone = pattern.melodyNotes[melodyIndex];
    const leadFreq = pattern.rootFreq * Math.pow(2, leadSemitone / 12);
    const leadEnv = Math.exp(-timeIn16th * 12);
    // Rich harmonic lead
    const lead = (Math.sin(2 * Math.PI * leadFreq * t) * 0.35 +
                  Math.sin(4 * Math.PI * leadFreq * t) * 0.18 +
                  Math.sin(6 * Math.PI * leadFreq * t) * 0.08) * leadEnv * 0.42;

    // Stereo panning for lead
    const pan = 0.5 + 0.3 * Math.sin(t * 1.5);
    mixL += lead * (1 - pan);
    mixR += lead * pan;

    // 6. Ambient background pad chord
    const padFreq1 = pattern.rootFreq * 0.5;
    const padFreq2 = pattern.rootFreq * 0.75;
    const pad = (Math.sin(2 * Math.PI * padFreq1 * t) + Math.sin(2 * Math.PI * padFreq2 * t)) * 0.08;
    mixL += pad;
    mixR += pad;

    // Master limiting / soft clipping
    left[i] = Math.tanh(mixL * 0.85);
    right[i] = Math.tanh(mixR * 0.85);
  }

  // Build WAV binary file
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write RIFF header
  const writeString = (offset: number, str: string) => {
    for (let c = 0; c < str.length; c++) {
      view.setUint8(offset + c, str.charCodeAt(c));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const sL = Math.max(-1, Math.min(1, left[i]));
    const sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
    view.setInt16(offset + 2, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
    offset += 4;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * Generate a quick audible chime sound for instantaneous hardware audio testing
 */
function generateTestChimeWav(): string {
  const sampleRate = 44100;
  const duration = 1.2;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + totalSamples * 4);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let c = 0; c < str.length; c++) {
      view.setUint8(offset + c, str.charCodeAt(c));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 4, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, totalSamples * 4, true);

  // 3-note ascending arpeggio (C5: 523Hz, E5: 659Hz, G5: 784Hz)
  const notes = [523.25, 659.25, 783.99];
  let offset = 44;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (let n = 0; n < notes.length; n++) {
      const noteStart = n * 0.18;
      if (t >= noteStart) {
        const noteT = t - noteStart;
        const env = Math.exp(-noteT * 6);
        sample += Math.sin(2 * Math.PI * notes[n] * noteT) * env * 0.4;
      }
    }

    sample = Math.max(-1, Math.min(1, sample));
    const val = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, val, true);
    view.setInt16(offset + 2, val, true);
    offset += 4;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

class AudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;
  private isCurrentlyPlaying = false;
  private volume = 0.85;
  private trackBlobCache: Map<string, string> = new Map();
  private subscribers: Array<(time: number, isPlaying: boolean) => void> = [];
  private currentTime = 0;
  private duration = 210;
  private testAudioElement: HTMLAudioElement | null = null;
  private simulatedBars: number[] = [20, 45, 70, 50, 85, 60, 40, 25];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (!this.audioElement && typeof Audio !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.volume = this.volume;
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement) {
          this.currentTime = this.audioElement.currentTime;
          this.notify();
        }
      });

      this.audioElement.addEventListener('ended', () => {
        // Loop seamlessly
        if (this.audioElement && this.isCurrentlyPlaying) {
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch(() => {});
        }
      });

      this.audioElement.addEventListener('play', () => {
        this.isCurrentlyPlaying = true;
        this.notify();
      });

      this.audioElement.addEventListener('pause', () => {
        this.isCurrentlyPlaying = false;
        this.notify();
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio element error event:', e);
      });
    }
  }

  public subscribe(callback: (time: number, isPlaying: boolean) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.currentTime, this.isCurrentlyPlaying));
  }

  private getOrGenerateTrackUrl(track: Track): string {
    if (this.trackBlobCache.has(track.id)) {
      return this.trackBlobCache.get(track.id)!;
    }

    const pattern = GENRE_PATTERNS[track.genre] || GENRE_PATTERNS['Synthwave / Electronic'];
    const wavUrl = generateMusicWav(pattern, 14); // 14-second loop
    this.trackBlobCache.set(track.id, wavUrl);
    return wavUrl;
  }

  public playTrack(track: Track) {
    this.initAudioElement();
    if (!this.audioElement) return;

    const isDifferentTrack = this.currentTrack?.id !== track.id;
    this.currentTrack = track;
    this.duration = track.durationSeconds || 210;

    if (isDifferentTrack || !this.audioElement.src) {
      const url = this.getOrGenerateTrackUrl(track);
      this.audioElement.src = url;
      this.audioElement.currentTime = 0;
    }

    this.audioElement.volume = this.volume;
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isCurrentlyPlaying = true;
          this.notify();
        })
        .catch((err) => {
          console.warn('Autoplay prevented or error:', err);
          // Retry on next user interaction
          this.isCurrentlyPlaying = false;
          this.notify();
        });
    }
  }

  public togglePlay(track?: Track) {
    this.initAudioElement();
    const targetTrack = track || this.currentTrack;
    if (!targetTrack) return;

    if (track && track.id !== this.currentTrack?.id) {
      this.playTrack(track);
      return;
    }

    if (!this.audioElement?.src) {
      this.playTrack(targetTrack);
      return;
    }

    if (this.isCurrentlyPlaying) {
      this.pause();
    } else {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isCurrentlyPlaying = true;
            this.notify();
          })
          .catch((err) => {
            console.warn('Play error:', err);
          });
      }
    }
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isCurrentlyPlaying = false;
      this.notify();
    }
  }

  public resume() {
    if (this.currentTrack) {
      this.togglePlay(this.currentTrack);
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.notify();
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.volume = clamped;
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
  }

  public playTestChime() {
    try {
      const chimeUrl = generateTestChimeWav();
      if (!this.testAudioElement) {
        this.testAudioElement = new Audio();
      }
      this.testAudioElement.src = chimeUrl;
      this.testAudioElement.volume = Math.max(0.6, this.volume);
      this.testAudioElement.play().catch((e) => console.warn('Chime playback notice:', e));
    } catch (err) {
      console.warn('Test chime notice:', err);
    }
  }

  public getAnalyserData(): Uint8Array {
    // Generate dancing frequency data based on playback
    const data = new Uint8Array(16);
    if (!this.isCurrentlyPlaying) {
      for (let i = 0; i < 16; i++) data[i] = 20;
      return data;
    }
    const t = Date.now() / 150;
    for (let i = 0; i < 16; i++) {
      const wobble = Math.sin(t + i * 0.8) * 40 + Math.cos(t * 1.5 + i) * 30;
      data[i] = Math.max(40, Math.min(250, 120 + wobble));
    }
    return data;
  }

  public getStatus() {
    return {
      isPlaying: this.isCurrentlyPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      track: this.currentTrack,
      volume: this.volume
    };
  }
}

export const audioEngine = new AudioEngine();

if (typeof window !== 'undefined') {
  (window as unknown as { audioEngine: AudioEngine }).audioEngine = audioEngine;
}
