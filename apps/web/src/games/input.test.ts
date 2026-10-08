import { describe, expect, it } from 'vitest';
import { combine, fromHold, fromRef, HELD_LEVEL } from './input';

describe('level sources', () => {
  it('reads a live ref every time it is called', () => {
    const ref = { current: 0.1 };
    const get = fromRef(ref);
    ref.current = 0.7;
    expect(get()).toBe(0.7);
  });
  it('hold button reports HELD_LEVEL only while pressed', () => {
    const held = { current: false };
    const get = fromHold(held);
    expect(get()).toBe(0);
    held.current = true;
    expect(get()).toBe(HELD_LEVEL);
  });
  it('combine picks the most active source, so any input can drive any game', () => {
    expect(combine(() => 0.2, () => 0.6, () => 0)()).toBe(0.6);
    expect(combine()()).toBe(0);
  });
});
