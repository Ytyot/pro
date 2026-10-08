/**
 * Every game reads a single number: how active the child is right now, from 0 (nothing) to 1 (full).
 * An input (the microphone, the hold button, or a future gesture model) only needs a small adapter
 * that turns its own output into this number. Games never talk to an input device directly.
 */
export type LevelSource = () => number;

/** Level reported while the hold button is pressed: above VOICE_ON, below the balloon's hard-start level. */
export const HELD_LEVEL = 0.55;

export const fromRef = (ref: { readonly current: number }): LevelSource => () => ref.current;

export const fromHold = (held: { readonly current: boolean }): LevelSource => () => (held.current ? HELD_LEVEL : 0);

/** Several inputs at once (e.g. mic + hold button): the most active one wins. */
export function combine(...sources: LevelSource[]): LevelSource {
  return () => sources.reduce((max, s) => Math.max(max, s()), 0);
}
