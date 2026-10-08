import { Fragment, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ChildScreen } from '../components/ChildScreen';
import { HoldButton } from '../components/HoldButton';
import { StickerReward } from '../components/StickerReward';
import { useChild } from '../pages/ChildLayout';
import { VoiceMeter } from './GameBits';
import { combine, fromHold, fromRef, type LevelSource } from './input';
import { useMicLevel } from './useMicLevel';

export { HELD_LEVEL } from './input';

export function GameShell({ title, hint, render }: {
  title: string;
  hint: string;
  render: (getLevel: LevelSource, finish: () => void) => ReactNode;
}) {
  const child = useChild();
  const nav = useNavigate();
  const mic = useMicLevel();
  const held = useRef(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(0);
  // Voice adapter + hold-button adapter. A future input (e.g. gestures) is one more source here.
  const getLevel = useMemo(() => combine(fromRef(mic.level), fromHold(held)), [mic.level]);
  const finish = useCallback(() => { mic.stop(); held.current = false; setFinished(true); }, [mic]);
  const playAgain = async () => { await mic.start(); setRound((r) => r + 1); setFinished(false); };

  if (finished) {
    return (
      <ChildScreen title={title}>
        <StickerReward childId={child.id} onDone={() => nav('..', { relative: 'path' })} onAgain={() => void playAgain()} />
      </ChildScreen>
    );
  }
  if (!started) {
    return (
      <ChildScreen title={title}>
        <div className="game-intro">
          <p className="speech-bubble">{hint}</p>
          <p className="muted parent-note">لولي الأمر: اقعد جنب طفلك وقول الكلمة الأول بهدوء، وهو يقلدك.</p>
          <button className="btn btn-primary" onClick={async () => { await mic.start(); setStarted(true); }}>يلا نبدأ</button>
        </div>
      </ChildScreen>
    );
  }
  const fallback = mic.status === 'denied' || mic.status === 'unsupported';
  return (
    <ChildScreen title={title}>
      <VoiceMeter getLevel={getLevel} />
      <Fragment key={round}>{render(getLevel, finish)}</Fragment>
      {fallback && (
        <div className="fallback">
          <p className="muted">المايك مش شغال. دوسوا مع بعض على الزرار وإنتوا بتتكلموا.</p>
          <HoldButton onChange={(v) => { held.current = v; }}>دوس وإنت بتتكلم</HoldButton>
        </div>
      )}
    </ChildScreen>
  );
}
