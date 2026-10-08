import { useRef, useState, type CSSProperties } from 'react';
import { Art } from '../art/Art';
import { Icon } from '../components/Icon';
import { speak } from '../lib/speak';
import { VOICE_ON } from '../logic/motion';
import type { LevelSource } from './input';
import { useFrame } from './useFrame';

const IDLE_MS = 6000;
const METER_TEXT = { on: 'سامعك!', wait: 'مستني صوتك', idle: 'يلا قول «آآآ»، أنا سامعك' } as const;

/** Shows that the game can hear the child. On/off only: louder never looks "better". */
export function VoiceMeter({ getLevel }: { getLevel: LevelSource }) {
  const [state, setState] = useState<keyof typeof METER_TEXT>('wait');
  const quietMs = useRef(0);
  useFrame((dt) => {
    const on = getLevel() >= VOICE_ON;
    quietMs.current = on ? 0 : quietMs.current + dt;
    setState(on ? 'on' : quietMs.current > IDLE_MS ? 'idle' : 'wait');
  }, true);
  return (
    <div className={`voice-meter ${state}`} aria-hidden="true">
      <Art code="1F3A4" size={28} />
      <span>{METER_TEXT[state]}</span>
    </div>
  );
}

export function TurnProgress({ value, label, text }: { value: number; label: string; text?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <>
      <div className="turn-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ inlineSize: `${pct}%` }} />
      </div>
      {text && <p className="progress-text">{text}</p>}
    </>
  );
}

export function Celebrate({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="celebrate" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--i': i } as CSSProperties}><Art code="1F31F" size={36} /></span>)}
    </div>
  );
}

/** Lets the parent play the word aloud so the child can copy it. */
export function HearWord({ text }: { text: string }) {
  return (
    <button className="round-btn" onClick={() => speak(text, 'ar')} aria-label="اسمع الكلمة"><Icon name="speaker" /></button>
  );
}
