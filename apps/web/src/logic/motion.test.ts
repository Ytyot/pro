import { describe, expect, it } from 'vitest';
import {
  balloonStart, balloonStep, bubbleStep, FISH_X, fishStart, fishStep, rmsToLevel, rocketStep, snakeStart, snakeStep, turtleStep,
} from './motion';

const run = <S>(s: S, step: (s: S, l: number, dt: number) => S, levels: number[], dt = 16) =>
  levels.reduce((acc, l) => step(acc, l, dt), s);

describe('rmsToLevel', () => {
  it('maps silence to 0 and loud speech to 1', () => {
    expect(rmsToLevel(0)).toBe(0);
    expect(rmsToLevel(0.0005)).toBe(0);
    expect(rmsToLevel(0.5)).toBe(1);
    expect(rmsToLevel(0.03)).toBeGreaterThan(0.3);
  });
});

describe('turtle', () => {
  it('walks only while there is voice, and never past the end', () => {
    expect(turtleStep(0.2, 0.1, 500)).toBe(0.2);
    expect(turtleStep(0.2, 0.5, 400)).toBeCloseTo(0.3);
    expect(turtleStep(0.99, 0.9, 1000)).toBe(1);
  });
  it('does not walk faster for louder voice (no reward for pushing)', () => {
    expect(turtleStep(0, 0.4, 100)).toBe(turtleStep(0, 1, 100));
  });
});

describe('balloon', () => {
  it('grows with a gentle start', () => {
    const ramp = [0.05, 0.2, 0.35, 0.5, 0.65, 0.8, ...Array(60).fill(0.6)];
    const s = run(balloonStart, balloonStep, ramp);
    expect(s.size).toBeGreaterThan(0.2);
    expect(s.wobbleMs).toBe(0);
  });
  it('wobbles instead of growing after a sudden loud start', () => {
    const s = run(balloonStart, balloonStep, [0.02, 0.9]);
    expect(s.wobbleMs).toBeGreaterThan(0);
    const later = balloonStep(s, 0.9, 16);
    expect(later.size).toBe(s.size);
  });
  it('the wobble wears off and growth resumes', () => {
    const s = run(balloonStart, balloonStep, [0.02, 0.9, ...Array(50).fill(0.5)]);
    expect(s.wobbleMs).toBe(0);
    expect(s.size).toBeGreaterThan(0);
  });
});

describe('snake', () => {
  it('grows while the sound is held and ends after a pause', () => {
    let s = run(snakeStart, snakeStep, Array(70).fill(0.5)); // ~1.1 s of voice
    expect(s.length).toBeGreaterThan(0.3);
    expect(s.done).toBe(false);
    s = run(s, snakeStep, Array(40).fill(0)); // 640 ms of quiet
    expect(s.done).toBe(true);
  });
  it('a short blip does not end the turn', () => {
    const s = run(snakeStart, snakeStep, [...Array(10).fill(0.5), ...Array(50).fill(0)]);
    expect(s.done).toBe(false);
  });
});

describe('bubbles', () => {
  it('spawns steadily while blowing, not at all when quiet', () => {
    let acc = 0;
    let spawned = 0;
    for (let i = 0; i < 60; i++) { const r = bubbleStep(acc, 0.25, 16); acc = r.accMs; if (r.spawn) spawned++; }
    expect(spawned).toBeGreaterThanOrEqual(4);
    expect(bubbleStep(0, 0.05, 1000).spawn).toBe(false);
  });
});

describe('rocket', () => {
  it('climbs only while there is voice, and stops at the moon', () => {
    expect(rocketStep(0.4, 0.1, 500)).toBe(0.4);
    expect(rocketStep(0, 0.5, 500)).toBeCloseTo(0.1);
    expect(rocketStep(0.99, 0.9, 1000)).toBe(1);
  });
  it('does not climb faster for louder voice', () => {
    expect(rocketStep(0, 0.4, 100)).toBe(rocketStep(0, 1, 100));
  });
});

describe('fish', () => {
  it('rises with voice, drifts down when quiet, and stays inside the sea', () => {
    const up = fishStep(fishStart, 0.5, 500);
    expect(up.y).toBeGreaterThan(fishStart.y);
    expect(fishStep(up, 0, 500).y).toBeLessThan(up.y);
    expect(fishStep({ ...fishStart, y: 0.99 }, 0.9, 1000).y).toBe(1);
    expect(fishStep({ ...fishStart, y: 0.01 }, 0, 1000).y).toBe(0);
  });
  it('does not swim faster for louder voice', () => {
    expect(fishStep(fishStart, 0.4, 100).y).toBe(fishStep(fishStart, 1, 100).y);
  });
  it('spawns treasures over time', () => {
    const s = run(fishStart, (st, l, dt) => fishStep(st, l, dt, () => 0.5), Array(40).fill(0));
    expect(s.items.length).toBeGreaterThan(0);
    expect(s.nextId).toBeGreaterThan(0);
  });
  it('collects a treasure it touches', () => {
    const s = { ...fishStart, y: 0.5, spawnMs: 0, items: [{ id: 1, x: FISH_X, y: 0.5 }] };
    const after = fishStep(s, 0, 16);
    expect(after.caught).toBe(1);
    expect(after.items).toHaveLength(0);
  });
  it('missed treasures float away without taking anything back', () => {
    const s = { ...fishStart, y: 0, spawnMs: 0, caught: 3, items: [{ id: 1, x: -0.09, y: 0.9 }] };
    const after = fishStep(s, 0, 50);
    expect(after.caught).toBe(3);
    expect(after.items).toHaveLength(0);
  });
});
