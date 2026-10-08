import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Art } from '../art/Art';
import { ChildScreen } from '../components/ChildScreen';
import { Icon } from '../components/Icon';
import { speech, type Story } from '../content';
import { speak } from '../lib/speak';
import { Celebrate, TurnProgress } from '../games/GameBits';

export function Stories() {
  const { storyId } = useParams();
  const story = speech.stories.find((s) => s.id === storyId);
  if (!story) {
    return (
      <ChildScreen title="حكايات">
        <div className="tiles">
          {speech.stories.map((s, k) => (
            <Link key={s.id} className={`tile ${['sage', 'sky', 'sun', 'clay'][k % 4]}`} to={s.id}><Art code={s.frames[0]!.art} />{s.title}</Link>
          ))}
        </div>
      </ChildScreen>
    );
  }
  // Keyed by story so opening another story always starts on its first page.
  return <StoryReader key={story.id} story={story} />;
}

function StoryReader({ story }: { story: Story }) {
  const [i, setI] = useState(0);
  const n = story.frames.length;

  if (i >= n) {
    return (
      <ChildScreen title={story.title}>
        <div className="story" aria-live="polite">
          <div className="talk-card story-page"><Art code="1F389" size={130} /><p>خلصت الحكاية!</p></div>
          <Celebrate show />
          <div className="story-recap" aria-hidden="true">
            {story.frames.map((f, k) => <Art key={k} code={f.art} size={48} />)}
          </div>
          <div className="row story-nav">
            <button className="btn" onClick={() => setI(0)}>نقراها تاني</button>
            <Link className="btn btn-primary" to=".." relative="path">حكاية تانية</Link>
          </div>
          <p className="muted parent-note">لولي الأمر: بصّوا على الصور مع بعض، وخلّي طفلك يحكي الحكاية بكلامه.</p>
        </div>
      </ChildScreen>
    );
  }

  const f = story.frames[i]!;
  const last = i === n - 1;
  return (
    <ChildScreen title={story.title}>
      <div className="story">
        <div key={i} className="talk-card story-page"><Art code={f.art} size={170} /><p>{f.text}</p></div>
        <TurnProgress value={(i + 1) / n} label="الحكاية وصلت لفين" text={`صفحة ${i + 1} من ${n}`} />
        <div className="row story-nav">
          <button className="btn" onClick={() => setI(i - 1)} disabled={i === 0}>اللي قبلها</button>
          <button className="round-btn" onClick={() => speak(f.text, 'ar')} aria-label="اسمع"><Icon name="speaker" /></button>
          <button className="btn btn-primary" onClick={() => setI(i + 1)}>{last ? 'خلصنا' : 'وبعدين؟'}</button>
        </div>
        <p className="muted parent-note">لولي الأمر: اسأل طفلك «إيه اللي حصل؟» وسيبه يحكي براحته.</p>
      </div>
    </ChildScreen>
  );
}
