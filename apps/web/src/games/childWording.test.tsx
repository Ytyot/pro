import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { GAMES } from '../pages/VoiceGames';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Spec §2: never tell the child "slow down" / "calm down" — that wording is for the parent guide only.
const BANNED = ['اهدى', 'براحة', 'بالراحة', 'ببطء', 'بهدوء', 'خد نفس'];

describe('child-facing game text', () => {
  it('game intros avoid calm-down / slow-down wording', () => {
    for (const g of Object.values(GAMES)) for (const w of BANNED) expect(g.hint).not.toContain(w);
  });
  it('game boards avoid calm-down / slow-down wording', () => {
    for (const { Board } of Object.values(GAMES)) {
      const { container, unmount } = render(<Board getLevel={() => 0} onFinish={() => {}} />);
      for (const w of BANNED) expect(container.textContent).not.toContain(w);
      unmount();
    }
  });
  it('every voice game is listed on the games screen', () => {
    expect(Object.keys(GAMES)).toEqual(['turtle', 'balloon', 'snake', 'bubbles', 'rocket', 'star', 'fish']);
  });
  it('learning games avoid calm-down / slow-down wording', () => {
    for (const f of ['ListenPick', 'MatchGame', 'CountGame', 'TraceGame']) {
      const src = readFileSync(resolve(__dirname, '../learn', f + '.tsx'), 'utf8');
      for (const w of BANNED) expect(src, f).not.toContain(w);
    }
  });
});
