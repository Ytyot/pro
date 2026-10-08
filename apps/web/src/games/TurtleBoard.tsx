import { useMemo, useState } from 'react';
import { Art } from '../art/Art';
import { Turtle } from '../art/Turtle';
import { speech } from '../content';
import { shuffle } from '../logic/leitner';
import { turtleStep, VOICE_ON } from '../logic/motion';
import { Celebrate, HearWord } from './GameBits';
import type { BoardProps } from './input';
import { useFrame } from './useFrame';

const TURNS = 5;

export function TurtleBoard({ getLevel, onFinish, level = 0 }: BoardProps) {
  const turns = TURNS + level;
  const words = useMemo(() => shuffle(speech.words).slice(0, turns), [turns]);
  const [turn, setTurn] = useState(0);
  const [progress, setProgress] = useState(0);
  const [talking, setTalking] = useState(false);
  const arrived = progress >= 1;

  useFrame((dt) => {
    const level = getLevel();
    setTalking(level >= VOICE_ON);
    setProgress((p) => turtleStep(p, level, dt));
  }, !arrived);

  const next = () => {
    if (turn + 1 >= turns) onFinish();
    else { setTurn(turn + 1); setProgress(0); }
  };
  const word = words[turn]!;

  return (
    <div className="board">
      <div className="word-card"><Art code={word.art} size={120} /><span>{word.text}</span><HearWord text={word.text} /></div>
      <div className="track" aria-hidden="true">
        <div className="track-goal"><Art code="1F96C" size={48} /></div>
        <div className="track-runner" style={{ insetInlineStart: `${progress * 72}%` }}>
          <Turtle size={110} walking={talking && !arrived} />
        </div>
        <Celebrate show={arrived} />
      </div>
      <p className="board-hint">{arrived ? 'وصلت السلحفاة!' : 'قول الكلمة بنعومة ومطّها، والسلحفاة تمشي'}</p>
      {arrived && <button className="btn btn-primary" onClick={next}>{turn + 1 >= turns ? 'خلصنا' : 'الكلمة اللي بعدها'}</button>}
      <Dots n={turns} at={turn} showCount />
    </div>
  );
}

export function Dots({ n, at, showCount = false }: { n: number; at: number; showCount?: boolean }) {
  return (
    <>
      <div className="dots" aria-label={`${at + 1} من ${n}`}>
        {Array.from({ length: n }, (_, i) => <span key={i} className={i < at ? 'done' : i === at ? 'now' : ''} />)}
      </div>
      {showCount && <p className="progress-text" aria-hidden="true">دور {at + 1} من {n}</p>}
    </>
  );
}
