import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { Art } from '../art/Art';
import { Balloon } from '../art/Balloon';
import { Turtle } from '../art/Turtle';
import { ChildScreen } from '../components/ChildScreen';
import { GameShell } from '../games/GameShell';
import type { LevelSource } from '../games/input';
import { TurtleBoard } from '../games/TurtleBoard';
import { BalloonBoard } from '../games/BalloonBoard';
import { SnakeBoard } from '../games/SnakeBoard';
import { BubblesBoard } from '../games/BubblesBoard';
import { RocketBoard } from '../games/RocketBoard';
import { StarBoard } from '../games/StarBoard';
import { FishBoard } from '../games/FishBoard';

interface GameDef {
  title: string;
  hint: string;
  color: 'sage' | 'clay' | 'sun' | 'sky';
  icon: ReactNode;
  Board: (props: { getLevel: LevelSource; onFinish: () => void }) => ReactNode;
}

export const GAMES = {
  turtle: { title: 'السلحفاة', hint: 'السلحفاة بتمشي طول ما صوتك شغال وناعم. يلا نساعدها توصل للخس!',
    color: 'sage', icon: <Turtle size={96} />, Board: TurtleBoard },
  balloon: { title: 'البالونة', hint: 'ابدأ صوتك ناعم خالص، زي الهمسة، والبالونة تكبر تكبر…',
    color: 'clay', icon: <div style={{ width: 56, height: 90 }}><Balloon size={0.8} color="#D2543F" wobble={false} /></div>, Board: BalloonBoard },
  snake: { title: 'الثعبان', hint: 'مطّ أول صوت في الكلمة، والثعبان يطوّل!',
    color: 'sun', icon: <Art code="1F40D" size={72} />, Board: SnakeBoard },
  bubbles: { title: 'الفقاعات', hint: 'انفخ نفخة طويلة وهادية، وشوف الفقاعات بتطلع',
    color: 'sky', icon: <Art code="1FAE7" size={72} />, Board: BubblesBoard },
  rocket: { title: 'الصاروخ', hint: 'الصاروخ بيطير طول ما صوتك شغال. يلا نوصّله للقمر!',
    color: 'clay', icon: <Art code="1F680" size={72} />, Board: RocketBoard },
  star: { title: 'النجوم', hint: 'كل كلمة تقولها بتنوّر نجمة. يلا ننوّر السما كلها!',
    color: 'sky', icon: <Art code="2B50" size={72} />, Board: StarBoard },
  fish: { title: 'السمكة', hint: 'صوتك بيطلّع السمكة لفوق، ولما تسكت بتنزل. ساعدها تجمع الكنوز!',
    color: 'sage', icon: <Art code="1F41F" size={72} />, Board: FishBoard },
} satisfies Record<string, GameDef>;

export function VoiceGames() {
  return (
    <ChildScreen title="ألعاب الصوت">
      <div className="tiles">
        {Object.entries(GAMES).map(([id, g]) => (
          <Link key={id} className={`tile ${g.color}`} to={id}>{g.icon}{g.title}</Link>
        ))}
      </div>
    </ChildScreen>
  );
}

export function VoiceGame() {
  const { game = '' } = useParams();
  const g: GameDef | undefined = GAMES[game as keyof typeof GAMES];
  if (!g) return <VoiceGames />;
  const { Board } = g;
  return <GameShell key={game} title={g.title} hint={g.hint} render={(getLevel, finish) => <Board getLevel={getLevel} onFinish={finish} />} />;
}
