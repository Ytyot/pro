import { useEffect, useMemo, useState } from 'react';
import { Art } from '../art/Art';
import { speech } from '../content';
import { shuffle } from '../logic/leitner';
import { snakeStart, snakeStep } from '../logic/motion';
import { Celebrate, HearWord } from './GameBits';
import type { LevelSource } from './input';
import { useFrame } from './useFrame';

/** Star positions in the sky (x%, y% from the top), joined in this order once lit. */
const SPOTS = [[14, 70], [32, 38], [50, 66], [66, 28], [84, 58], [50, 12]] as const;

export function StarBoard({ getLevel, onFinish }: { getLevel: LevelSource; onFinish: () => void }) {
  const words = useMemo(() => shuffle(speech.words).slice(0, SPOTS.length), []);
  const [lit, setLit] = useState(0);
  // One star = one word: the same "voice, then a short pause" rule as the snake.
  const [s, setS] = useState(snakeStart);
  const done = lit >= SPOTS.length;

  useFrame((dt) => setS((prev) => snakeStep(prev, getLevel(), dt)), !done && !s.done);

  useEffect(() => {
    if (!s.done) return;
    const t = setTimeout(() => { setLit((l) => l + 1); setS(snakeStart); }, 700);
    return () => clearTimeout(t);
  }, [s.done]);

  const word = words[lit];
  const line = SPOTS.slice(0, lit).map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="board">
      {word && (
        <div className="word-card"><Art code={word.art} size={96} /><span>{word.text}</span><HearWord text={word.text} /></div>
      )}
      <div className="star-sky" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={line} /></svg>
        {SPOTS.map(([x, y], i) => {
          const glow = i < lit ? 1 : i === lit ? (s.done ? 1 : s.length) : 0;
          return (
            <span key={i} className={`sky-star${i < lit ? ' lit' : ''}${i === lit ? ' now' : ''}`}
              style={{ insetInlineStart: `${x}%`, insetBlockStart: `${y}%`, opacity: 0.3 + glow * 0.7, scale: `${0.7 + glow * 0.4}` }}>
              <Art code="2B50" size={44} />
            </span>
          );
        })}
        <Celebrate show={done} />
      </div>
      <p className="board-hint">{done ? 'السما كلها نوّرت!' : 'قول الكلمة بصوت ناعم وطويل، والنجمة تنوّر'}</p>
      {done && <button className="btn btn-primary" onClick={onFinish}>خلصنا</button>}
      <p className="muted star-count" aria-label={`${lit} من ${SPOTS.length}`}>{lit} / {SPOTS.length}</p>
    </div>
  );
}
