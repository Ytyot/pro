import { useState } from 'react';
import { Art } from '../art/Art';
import { rocketStep, VOICE_ON } from '../logic/motion';
import { Celebrate } from './GameBits';
import type { BoardProps } from './input';
import { Dots } from './TurtleBoard';
import { useFrame } from './useFrame';

const TURNS = 4;
const STARS = [0.3, 0.6];

export function RocketBoard({ getLevel, onFinish, level = 0 }: BoardProps) {
  const turns = TURNS + level;
  const [turn, setTurn] = useState(0);
  const [height, setHeight] = useState(0);
  const [flying, setFlying] = useState(false);
  const arrived = height >= 1;

  useFrame((dt) => {
    const level = getLevel();
    setFlying(level >= VOICE_ON);
    setHeight((h) => rocketStep(h, level, dt));
  }, !arrived);

  const next = () => {
    if (turn + 1 >= turns) onFinish();
    else { setTurn(turn + 1); setHeight(0); }
  };

  return (
    <div className="board">
      <div className="rocket-stage" aria-hidden="true">
        <div className="rocket-moon"><Art code="1F319" size={64} /></div>
        {STARS.map((m, i) => (
          <span key={m} className={`rocket-star${height >= m ? ' lit' : ''}`}
            style={{ insetBlockEnd: `${m * 72 + 10}%`, insetInlineStart: i % 2 ? '18%' : '68%' }}>
            <Art code="2B50" size={32} />
          </span>
        ))}
        <div className={`rocket${flying && !arrived ? ' flying' : ''}`} style={{ insetBlockEnd: `${height * 68 + 2}%` }}>
          <Art code="1F680" size={84} />
        </div>
        <Celebrate show={arrived} />
      </div>
      <p className="board-hint">{arrived ? 'الصاروخ وصل للقمر!' : 'قول «آآآ» طويلة وناعمة، والصاروخ يطلع لفوق'}</p>
      {arrived && <button className="btn btn-primary" onClick={next}>{turn + 1 >= turns ? 'خلصنا' : 'صاروخ كمان'}</button>}
      <Dots n={turns} at={turn} showCount />
    </div>
  );
}
