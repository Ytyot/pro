/** Loudness level (0–1) above which we treat the child as speaking. */
export const VOICE_ON = 0.3;
const QUIET = 0.15;
const BLOW_ON = 0.2;
/** Reaching loud speech within this long after silence counts as a hard (sudden) start. */
const HARD_START_MS = 60;

export function rmsToLevel(rms: number): number {
  if (rms <= 0) return 0;
  const db = 20 * Math.log10(rms);
  return Math.max(0, Math.min(1, (db + 60) / 50));
}

/** Moves 0→1 at a fixed speed while there is voice and stays put when quiet. Speed never depends on loudness. */
export function voiceProgress(progress: number, level: number, dtMs: number, fullMs: number): number {
  return level >= VOICE_ON ? Math.min(1, progress + dtMs / fullMs) : progress;
}

/** Turtle crosses the track in ~4 s of voice. */
export function turtleStep(progress: number, level: number, dtMs: number): number {
  return voiceProgress(progress, level, dtMs, 4000);
}

/** Rocket climbs to the moon in ~5 s of voice. */
export function rocketStep(height: number, level: number, dtMs: number): number {
  return voiceProgress(height, level, dtMs, 5000);
}

export interface BalloonState { size: number; wobbleMs: number; sinceQuietMs: number }
export const balloonStart: BalloonState = { size: 0, wobbleMs: 0, sinceQuietMs: 0 };

export function balloonStep(s: BalloonState, level: number, dtMs: number): BalloonState {
  const hardStart = level > 0.75 && s.sinceQuietMs < HARD_START_MS;
  const wobbleMs = hardStart ? 600 : Math.max(0, s.wobbleMs - dtMs);
  const grow = level >= VOICE_ON && wobbleMs === 0 ? dtMs / 3500 : 0;
  return {
    size: Math.min(1, s.size + grow),
    wobbleMs,
    sinceQuietMs: level < QUIET ? 0 : s.sinceQuietMs + dtMs,
  };
}

export interface SnakeState { length: number; voicedMs: number; silentMs: number; done: boolean }
export const snakeStart: SnakeState = { length: 0, voicedMs: 0, silentMs: 0, done: false };

export function snakeStep(s: SnakeState, level: number, dtMs: number): SnakeState {
  if (s.done) return s;
  if (level >= VOICE_ON) {
    const length = Math.min(1, s.length + dtMs / 3000);
    return { length, voicedMs: s.voicedMs + dtMs, silentMs: 0, done: length >= 1 };
  }
  const silentMs = s.silentMs + dtMs;
  return { ...s, silentMs, done: s.voicedMs >= 800 && silentMs >= 600 };
}

export function bubbleStep(accMs: number, level: number, dtMs: number): { spawn: boolean; accMs: number } {
  if (level < BLOW_ON) return { spawn: false, accMs: 0 };
  const acc = accMs + dtMs;
  return acc >= 180 ? { spawn: true, accMs: acc - 180 } : { spawn: false, accMs: acc };
}

export interface FishItem { id: number; x: number; y: number }
export interface FishState { y: number; items: FishItem[]; spawnMs: number; nextId: number; caught: number }
/** Where the fish swims across the sea (0 = inline start, 1 = inline end). */
export const FISH_X = 0.12;
const FISH_REACH_X = 0.08;
const FISH_REACH_Y = 0.16;
const FISH_SPAWN_MS = 1700;
export const fishStart: FishState = { y: 0.2, items: [], spawnMs: 1200, nextId: 0, caught: 0 };

/**
 * The fish rises while there is voice and drifts down when quiet (fixed speeds, never faster when louder).
 * Treasures float toward it; touching one collects it. Missed ones just float away — no penalty.
 */
export function fishStep(s: FishState, level: number, dtMs: number, rand: () => number = Math.random): FishState {
  const y = level >= VOICE_ON ? Math.min(1, s.y + dtMs / 1800) : Math.max(0, s.y - dtMs / 2600);
  const items = s.items.map((it) => ({ ...it, x: it.x - dtMs / 4500 }));
  let spawnMs = s.spawnMs + dtMs;
  let nextId = s.nextId;
  if (spawnMs >= FISH_SPAWN_MS) {
    spawnMs -= FISH_SPAWN_MS;
    items.push({ id: nextId++, x: 1, y: 0.1 + rand() * 0.8 });
  }
  const reached = (it: FishItem) => Math.abs(it.x - FISH_X) < FISH_REACH_X && Math.abs(it.y - y) < FISH_REACH_Y;
  const caught = items.filter(reached).length;
  return { y, items: items.filter((it) => !reached(it) && it.x > -0.1), spawnMs, nextId, caught: s.caught + caught };
}
