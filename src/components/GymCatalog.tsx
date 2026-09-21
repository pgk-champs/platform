import React, { useMemo, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import { buildCards, filterCards, chipCounts, type GymCard } from '../lib/gym';
import { plural } from '../lib/plural';
import TrainerGlyph from './TrainerGlyph';
import CodeTyping, { PRESET_POOLS } from './CodeTyping';
import TerminalSim, { type JsonTree } from './TerminalSim';
import GitSim, { type GitSimScenario } from './GitSim';
import HashPlayground from './HashPlayground';
import BlockChainDemo from './BlockChainDemo';
import SignDemo from './SignDemo';
import ComposePreview, { type ComposeNode } from './ComposePreview';
import ChmodCalc from './ChmodCalc';
import HotkeyTrainer from './HotkeyTrainer';
import WordOrder from './WordOrder';
import PredictOutput from './PredictOutput';
import './trainers.css';

// Зал. Карточки строятся из src/data/trainers.json — руками список больше не
// ведётся. Одиннадцать механик запускаются здесь (для них ниже лежат
// демо-данные), остальные тридцать пять ведут на якорь в своей главе.
// Результаты зала пишутся под chapterId='gym' и прогресс глав не трогают.
const GYM = 'gym';

// --- демо-данные для запускаемых механик: перенесены без изменений ---

const GYM_FS: JsonTree = {
  projects: { 'hello.txt': 'Привет из тренажёрного зала!' },
  docs: { 'plan.md': '# План тренировки\n1. ls\n2. cd projects\n3. cat hello.txt' },
  'readme.txt': 'Это песочница: команды help, ls, cd, cat, mkdir, touch, cp, mv, rm.',
};

const GYM_TREE: ComposeNode = {
  type: 'Column',
  fillMaxSize: true,
  padding: 16,
  arrangement: 'center',
  alignment: 'center',
  children: [
    { type: 'Text', text: 'Тренажёрный зал', fontSize: 22 },
    { type: 'Text', text: 'Собери экран сам', fontSize: 14 },
    { type: 'Button', text: 'Поехали' },
  ],
};

const HOTKEYS = [
  { action: 'Search Everywhere: найти файл, класс, действие — что угодно', mac: 'Shift, дважды', win: 'Shift, дважды', linux: 'Shift, дважды' },
  { action: 'Базовое автодополнение кода', mac: '⌃Space', win: 'Ctrl+Space', linux: 'Ctrl+Space' },
  { action: 'Быстрое исправление (intention actions)', mac: '⌥Enter', win: 'Alt+Enter', linux: 'Alt+Enter' },
  { action: 'Закомментировать/раскомментировать строку', mac: '⌘/', win: 'Ctrl+/', linux: 'Ctrl+/' },
  { action: 'Переформатировать код по стилю проекта', mac: '⌥⌘L', win: 'Ctrl+Alt+L', linux: 'Ctrl+Alt+L', browserReserved: true },
  { action: 'Переименовать символ везде (Rename)', mac: '⇧F6', win: 'Shift+F6', linux: 'Shift+F6' },
];

const PREDICT_CODE = `fun main() {
    var reps = 3
    reps += 4
    println(reps * 2)
}`;

const GIT_SCENARIOS: { id: GitSimScenario; label: string }[] = [
  { id: 'free', label: 'Свободный режим' },
  { id: 'first-commit', label: 'Первый коммит' },
  { id: 'branches', label: 'Ветки и merge' },
  { id: 'remote-demo', label: 'Удалённый репозиторий' },
];

function GymGit() {
  const [scenario, setScenario] = useState<GitSimScenario>('free');
  return (
    <>
      <div className="gym-scenarios">
        {GIT_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`button button--sm ${scenario === s.id ? 'button--primary' : 'button--secondary'}`}
            onClick={() => setScenario(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <GitSim key={scenario} scenario={scenario} chapterId={GYM} trainerId={`gym-git-${scenario}`} />
    </>
  );
}

// Парный список к RUNNABLE в src/lib/gym.ts: там его читает чип, здесь лежат
// демо-данные. Что они не разошлись, стережёт тест этого компонента.
// Partial, а не Record: искомой механики в словаре может не быть, и тип
// должен это говорить — иначе tsc считает проверку «Runner ?» бессмысленной.
const RUNNERS: Partial<Record<string, () => React.ReactElement>> = {
  CodeTyping: () => (
    <CodeTyping
      pools={[PRESET_POOLS.latin, PRESET_POOLS.symbols, PRESET_POOLS.code, PRESET_POOLS.git]}
      keyboard
      chapterId={GYM}
      trainerId="gym-typing"
    />
  ),
  TerminalSim: () => <TerminalSim initialFs={GYM_FS} chapterId={GYM} trainerId="gym-terminal" />,
  GitSim: () => <GymGit />,
  HashPlayground: () => <HashPlayground chapterId={GYM} trainerId="gym-hash" />,
  BlockChainDemo: () => <BlockChainDemo chapterId={GYM} trainerId="gym-chain" />,
  SignDemo: () => <SignDemo chapterId={GYM} trainerId="gym-sign" />,
  ComposePreview: () => (
    <ComposePreview editable tree={GYM_TREE} chapterId={GYM} trainerId="gym-compose" />
  ),
  ChmodCalc: () => <ChmodCalc chapterId={GYM} trainerId="gym-chmod" />,
  HotkeyTrainer: () => <HotkeyTrainer items={HOTKEYS} chapterId={GYM} trainerId="gym-hotkeys" />,
  WordOrder: () => (
    <WordOrder phrase="please review my pull request" chapterId={GYM} trainerId="gym-wordorder" />
  ),
  PredictOutput: () => (
    <PredictOutput expected="14" code={PREDICT_CODE} chapterId={GYM} trainerId="gym-predict" />
  ),
};

function Card({ card, onRun, running }: { card: GymCard; onRun: () => void; running: boolean }) {
  const [open, setOpen] = useState(false);
  const Runner = RUNNERS[card.component];
  const pct = card.count > 0 ? Math.round((100 * card.done) / card.count) : 0;

  return (
    <div className="gc-card">
      <div className="gc-head">
        <TrainerGlyph id={card.glyph} />
        <span className="gc-name">{card.name}</span>
        <span className={`gc-tag ${Runner ? 'gc-tag-run' : ''}`}>
          {Runner ? 'запускается' : 'в главе'}
        </span>
      </div>
      <p className="gc-blurb">{card.blurb}</p>

      {card.count > 1 && (
        <p className="gc-count">
          {card.count} {plural(card.count, 'упражнение', 'упражнения', 'упражнений')}
        </p>
      )}

      {card.done > 0 && (
        <>
          <div className="gc-bar" aria-hidden="true">
            <span className="gc-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="gc-done">
            {card.done === card.count ? 'пройдено' : `${card.done} из ${card.count}`}
          </p>
        </>
      )}

      {Runner ? (
        // Тренажёр открывается НАД сеткой во всю ширину, а не внутри
        // карточки: в колонке 300px клавиатурный тренажёр и терминал
        // нечитаемы, а соседние четыре карточки растягивались до его высоты.
        <button
          type="button"
          className={`button button--sm gc-run ${running ? 'button--secondary' : 'button--primary'}`}
          onClick={onRun}
          aria-pressed={running}
        >
          {running ? 'Идёт наверху ↑' : 'Запустить'}
        </button>
      ) : card.count === 1 ? (
        <Link className="gc-link" to={card.exercises[0].href}>
          Открыть в главе «{card.exercises[0].chapterTitle}» →
        </Link>
      ) : (
        <>
          <button type="button" className="gc-link gc-link-btn" onClick={() => setOpen(!open)}>
            {open ? 'Свернуть список' : 'Где встречается →'}
          </button>
          {open && (
            <ul className="gc-list">
              {card.exercises.map((e) => (
                <li key={e.href}>
                  <Link to={e.href}>{e.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function GymCatalog(): React.ReactElement {
  const cards = useMemo(() => buildCards(), []);
  const chips = useMemo(() => chipCounts(cards), [cards]);
  const [q, setQ] = useState('');
  const [chip, setChip] = useState('all');
  const [running, setRunning] = useState<GymCard | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shown = filterCards(cards, q, chip);
  const total = cards.reduce((s, c) => s + c.count, 0);

  const run = (card: GymCard) => {
    setRunning((cur) => (cur?.component === card.component ? null : card));
    // Показать сцену сразу: иначе нажатие в конце длинной сетки выглядит как
    // «кнопка не сработала» — тренажёр открылся за экраном, наверху.
    requestAnimationFrame(() => stage.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const Runner = running ? RUNNERS[running.component] : undefined;

  return (
    <div className="gc">
      <p className="gc-note">
        Механики платформы целиком: {cards.length} штук на {total}{' '}
        {plural(total, 'упражнение', 'упражнения', 'упражнений')}. Результаты зала не идут в
        прогресс глав — это чистая тренировка.
      </p>

      <input
        type="search"
        className="gc-search"
        placeholder="терминал, git, dp…"
        aria-label="Поиск тренажёра"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div ref={stage} className="gc-stage-anchor" />
      {running && Runner ? (
        <section className="gc-stage" aria-label={`Тренажёр: ${running.name}`}>
          <div className="gc-stage-head">
            <TrainerGlyph id={running.glyph} />
            <h2 className="gc-stage-name">{running.name}</h2>
            <span className="gc-stage-blurb">{running.blurb}</span>
            <button
              type="button"
              className="button button--sm button--secondary"
              onClick={() => setRunning(null)}
            >
              Закрыть
            </button>
          </div>
          {/* key — чтобы при переключении механики движок начинался заново,
              а не донашивал состояние прошлого. */}
          <div className="gc-stage-body" key={running.component}>
            {Runner()}
          </div>
        </section>
      ) : null}

      <div className="gc-chips">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`gc-chip ${chip === c.id ? 'gc-chip-on' : ''}`}
            onClick={() => setChip(c.id)}
          >
            {c.label} {c.n}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="gc-empty">
          По запросу «{q}» ничего не нашлось. Попробуй короче — поиск смотрит название и описание.
        </p>
      ) : (
        <div className="gc-grid">
          {shown.map((c) => (
            <Card
              key={c.component}
              card={c}
              running={running?.component === c.component}
              onRun={() => run(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
