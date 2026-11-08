import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCOVERY_TRACKS } from './data/mockTracks.js';
import { audioEngine } from './utils/audioEngine.js';

test('MP3Paw discovery tracks dataset is valid and complete', () => {
  assert.ok(DISCOVERY_TRACKS.length > 0, 'Discovery tracks should not be empty');
  
  for (const track of DISCOVERY_TRACKS) {
    assert.ok(track.id, 'Track must have an ID');
    assert.ok(track.title, 'Track must have a title');
    assert.ok(track.artist, 'Track must have an artist');
    assert.ok(track.artwork.startsWith('http'), 'Track must have a valid artwork URL');
    assert.ok(track.duration, 'Track must have duration formatted string');
    assert.ok(track.durationSeconds > 0, 'Track duration in seconds must be positive');
    assert.ok(['320kbps', '256kbps', '192kbps', '128kbps'].includes(track.bitrate), 'Bitrate must be valid');
    assert.ok(track.fileSize.includes('MB'), 'File size must be specified in MB');
    assert.ok(track.providerUrl.startsWith('https://mp3paw'), 'Provider URL must link to MP3Paw source');
    assert.ok(track.embedUrl.startsWith('https://mp3paw'), 'Embed URL must link to MP3Paw embed');
  }
});

test('Search query filter correctly filters tracks by title, artist, and genre', () => {
  const query = 'luna';
  const filtered = DISCOVERY_TRACKS.filter(t => 
    t.title.toLowerCase().includes(query) ||
    t.artist.toLowerCase().includes(query) ||
    t.genre.toLowerCase().includes(query)
  );
  assert.ok(filtered.length >= 1, 'Should find at least 1 track matching Luna');
  assert.equal(filtered[0].title, 'Midnight City Echoes');
});

test('Quality filter correctly isolates 320kbps tracks', () => {
  const hqTracks = DISCOVERY_TRACKS.filter(t => t.bitrate === '320kbps');
  assert.ok(hqTracks.length > 0, 'Must have 320kbps tracks');
  for (const t of hqTracks) {
    assert.equal(t.bitrate, '320kbps');
  }
});

test('Open Provider fallback URL and iframe requirements', () => {
  for (const track of DISCOVERY_TRACKS) {
    // Provider URL must not be identical to an internal path; it must be a direct provider link
    assert.match(track.providerUrl, /^https:\/\/mp3paw\.cool\/track\//);
    // Embed URL must include embed parameter
    assert.match(track.embedUrl, /^https:\/\/mp3paw\.cool\/embed\//);
  }
});

test('AudioEngine status and subscription lifecycle', () => {
  const initialStatus = audioEngine.getStatus();
  assert.equal(typeof initialStatus.isPlaying, 'boolean');
  assert.equal(typeof initialStatus.currentTime, 'number');

  let notified = false;
  const unsubscribe = audioEngine.subscribe((time, isPlaying) => {
    notified = true;
  });

  audioEngine.seek(45);
  const statusAfterSeek = audioEngine.getStatus();
  assert.equal(statusAfterSeek.currentTime, 45);
  assert.ok(notified, 'Subscriber should be notified on seek');

  unsubscribe();
});

