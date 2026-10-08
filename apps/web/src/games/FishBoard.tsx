import { useState } from 'react';
import { Art } from '../art/Art';
import { FISH_X, fishStart, fishStep } from '../logic/motion';
import { Celebrate, TurnProgress } from './GameBits';
import type { BoardProps } from './input';
import { useFrame } from './useFrame';

const GOAL = 6;

export function FishBoard({ getLevel, onFinish, level = 0 }: BoardProps) {
  const goal = GOAL + level * 2;
  const [s, setS] = useState(fishStart);
  const done = s.caught >= goal;

  useFrame((dt) => setS((prev) => fishStep(prev, getLevel(), dt)), !done);

  return (
    <div className="board">
      <div className="fish-sea" aria-hidden="true">
        {s.items.map((it) => (
          <span key={it.id} className="fish-item" style={{ insetInlineStart: `${it.x * 100}%`, insetBlockEnd: `${it.y * 80 + 6}%` }}>
            <Art code="2B50" size={40} />
          </span>
        ))}
        <span className="fish" style={{ insetInlineStart: `${FISH_X * 100}%`, insetBlockEnd: `${s.y * 80 + 6}%` }}>
          <Art code="1F41F" size={72} />
        </span>
        <Celebrate show={done} />
      </div>
      <TurnProgress value={s.caught / goal} label="النجوم اللي السمكة جمعتها" text={`${Math.min(s.caught, goal)} من ${goal} نجوم`} />
      <p className="board-hint">{done ? 'السمكة جمعت كل النجوم!' : 'اتكلم بصوت طويل والسمكة تطلع، اسكت وهي تنزل. يلا نجمع النجوم!'}</p>
      {done && <button className="btn btn-primary" onClick={onFinish}>خلصنا</button>}
    </div>
  );
}
