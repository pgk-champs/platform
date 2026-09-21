import trainers from '../data/trainers.json';
import knowledgeMap from '../data/knowledge-map.json';
import { TRAINER_NAMES } from '../data/trainer-names';
import type { GlyphId } from '../components/TrainerGlyph';
import { store } from './store';

// Логика Зала отдельно от вёрстки: vitest не резолвит @docusaurus/*, а сборку
// карточек, поиск и чипы проверять надо. Компонент отсюда только читает.

type Exercise = {
  title: string;
  chapterId: string;
  track: string;
  path: string;
  blockId: string | null;
  trainerId: string;
};
type Mechanic = { component: string; exercises: Exercise[] };

export type GymCard = {
  component: string;
  name: string;
  blurb: string;
  glyph: GlyphId;
  tracks: string[];
  count: number;
  runnable: boolean;
  exercises: { title: string; href: string; chapterTitle: string }[];
  done: number;
};

// Механики, у которых есть демо-данные и которые запускаются прямо в зале.
// Остальные 35 честно ведут в главу: половина из них осмысленна только там.
// Список парный к RUNNERS в GymCatalog.tsx, их сверяет тест того компонента.
export const RUNNABLE = [
  'CodeTyping',
  'TerminalSim',
  'GitSim',
  'HashPlayground',
  'BlockChainDemo',
  'SignDemo',
  'ComposePreview',
  'ChmodCalc',
  'HotkeyTrainer',
  'WordOrder',
  'PredictOutput',
];

const TITLE_BY_ID: Record<string, string> = Object.fromEntries(
  (knowledgeMap as { id: string; title: string }[]).map((e) => [e.id, e.title]),
);

export function buildCards(): GymCard[] {
  const progress = store.getProgress();
  return (trainers as Mechanic[]).map((m) => {
    const meta = TRAINER_NAMES[m.component] ?? { name: m.component, blurb: '', glyph: 'code' as GlyphId };
    return {
      component: m.component,
      name: meta.name,
      blurb: meta.blurb,
      glyph: meta.glyph,
      tracks: [...new Set(m.exercises.map((e) => e.track))],
      count: m.exercises.length,
      runnable: RUNNABLE.includes(m.component),
      exercises: m.exercises.map((e) => ({
        // У 85 упражнений из 228 своего title нет — почти все это наборы
        // слепой печати. Там подписываемся главой, а не пустой строкой.
        title: e.title || TITLE_BY_ID[e.chapterId] || e.chapterId,
        // Без blockId якоря в HTML нет — ведём на главу, а не на
        // несуществующий #. Так у 84 наборов печати из 228.
        href: e.blockId ? `/docs/${e.path}#${e.blockId}` : `/docs/${e.path}`,
        chapterTitle: TITLE_BY_ID[e.chapterId] ?? e.chapterId,
      })),
      done: m.exercises.filter((e) => progress.trainers[e.chapterId]?.[e.trainerId]).length,
    };
  });
}

export function filterCards(cards: GymCard[], q: string, chip: string): GymCard[] {
  const needle = q.trim().toLowerCase();
  return cards.filter((c) => {
    if (chip === 'runnable' && !c.runnable) return false;
    if (chip !== 'all' && chip !== 'runnable' && !c.tracks.includes(chip)) return false;
    if (!needle) return true;
    return `${c.name} ${c.blurb}`.toLowerCase().includes(needle);
  });
}

const TRACK_LABEL: Record<string, string> = {
  foundation: 'Фундамент',
  mobile: 'Мобилка',
  blockchain: 'Блокчейн',
  advanced: 'Отдельные темы',
};

export function chipCounts(cards: GymCard[]): { id: string; label: string; n: number }[] {
  return [
    { id: 'all', label: 'Всё', n: cards.length },
    ...Object.entries(TRACK_LABEL).map(([id, label]) => ({
      id,
      label,
      n: cards.filter((c) => c.tracks.includes(id)).length,
    })),
    { id: 'runnable', label: 'Запускаются здесь', n: cards.filter((c) => c.runnable).length },
  ];
}
