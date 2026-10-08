import { useRef, useState } from 'react';
import { bubbleStep } from '../logic/motion';
import { Celebrate, TurnProgress } from './GameBits';
import type { LevelSource } from './input';
import { useFrame } from './useFrame';

interface Bubble { id: number; x: number; r: number; popped?: boolean }

export function BubblesBoard({ getLevel, onFinish, goal = 25 }: { getLevel: LevelSource; onFinish: () => void; goal?: number }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [count, setCount] = useState(0);
  const acc = useRef(0);
  const nextId = useRef(0);
  const done = count >= goal;

  useFrame((dt) => {
    const r = bubbleStep(acc.current, getLevel(), dt);
    acc.current = r.accMs;
    if (!r.spawn) return;
    const b = { id: nextId.current++, x: 10 + Math.random() * 80, r: 14 + Math.random() * 18 };
    setBubbles((bs) => [...bs.slice(-24), b]);
    setCount((c) => c + 1);
  }, !done);

  const pop = (id: number) => setBubbles((bs) => bs.map((x) => (x.id === id ? { ...x, popped: true } : x)));

  return (
    <div className="board">
      <div className="bubble-stage" aria-hidden="true">
        {bubbles.map((b) => (
          <span key={b.id} className={`bubble${b.popped ? ' popped' : ''}`}
            style={{ insetInlineStart: `${b.x}%`, width: b.r * 2, height: b.r * 2 }}
            onPointerDown={() => pop(b.id)}
            onAnimationEnd={() => setBubbles((bs) => bs.filter((x) => x.id !== b.id))} />
        ))}
        <Celebrate show={done} />
      </div>
      <TurnProgress value={count / goal} label={`${Math.min(count, goal)} فقاعة من ${goal}`} />
      <p className="board-hint">{done ? 'فقاعات كتير حلوة!' : 'انفخ نفخة طويلة ناعمة، زي ما بتطفي شمعة من بعيد. ودوس على الفقاعة تفرقعها!'}</p>
      {done && <button className="btn btn-primary" onClick={onFinish}>خلصنا</button>}
    </div>
  );
}
