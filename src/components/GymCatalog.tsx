import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import knowledgeMap from '../data/knowledge-map.json';
import Fold from './Fold';
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

// Каталог всех механик платформы, запускаемых отдельно от глав.
// Результаты standalone-запусков живут в store под chapterId='gym',
// поэтому прогресс глав они не трогают.
const GYM = 'gym';

type MapEntry = { id: string; title: string; path: string };
const CHAPTERS = new Map((knowledgeMap as MapEntry[]).map((e) => [e.id, e]));

function ChapterRef({ id }: { id: string }) {
  const ch = CHAPTERS.get(id);
  if (!ch) return null;
  return (
    <span className="gym-chapter">
      встречается в главе <Link to={`/docs/${ch.path.replace(/\.mdx?$/, '')}`}>«{ch.title}»</Link>
    </span>
  );
}

function Card({ name, chapter, children }: { name: string; chapter: string; children: React.ReactNode }) {
  return (
    <div className="gym-card">
      <div className="gym-card-head">
        <span className="gym-card-name">{name}</span>
        <ChapterRef id={chapter} />
      </div>
      <Fold title="Открыть тренажёр">{children}</Fold>
    </div>
  );
}

// --- демо-данные для standalone-запусков ---

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

export default function GymCatalog() {
  return (
    <div className="gym-catalog">
      <section className="gym-section">
        <h2>Печать</h2>
        <Card name="Слепая печать" chapter="typing">
          <CodeTyping
            pools={[PRESET_POOLS.latin, PRESET_POOLS.symbols, PRESET_POOLS.code, PRESET_POOLS.git]}
            keyboard
            chapterId={GYM}
            trainerId="gym-typing"
          />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Терминал</h2>
        <Card name="Терминал Linux" chapter="linux-terminal">
          <TerminalSim initialFs={GYM_FS} chapterId={GYM} trainerId="gym-terminal" />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Git</h2>
        <Card name="Git-тренажёр" chapter="git-first-commit">
          <GymGit />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Крипто</h2>
        <Card name="Хеш-площадка" chapter="what-is-blockchain">
          <HashPlayground chapterId={GYM} trainerId="gym-hash" />
        </Card>
        <Card name="Цепочка блоков" chapter="what-is-blockchain">
          <BlockChainDemo chapterId={GYM} trainerId="gym-chain" />
        </Card>
        <Card name="Цифровая подпись" chapter="what-is-blockchain">
          <SignDemo chapterId={GYM} trainerId="gym-sign" />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Compose</h2>
        <Card name="Конструктор Compose-экрана" chapter="first-compose-screen">
          <ComposePreview editable tree={GYM_TREE} chapterId={GYM} trainerId="gym-compose" />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Права</h2>
        <Card name="Калькулятор chmod" chapter="files-packages-ssh">
          <ChmodCalc chapterId={GYM} trainerId="gym-chmod" />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Клавиши</h2>
        <Card name="Горячие клавиши IDE" chapter="android-studio">
          <HotkeyTrainer items={HOTKEYS} chapterId={GYM} trainerId="gym-hotkeys" />
        </Card>
      </section>

      <section className="gym-section">
        <h2>Разное</h2>
        <Card name="Собери фразу" chapter="it-english">
          <WordOrder phrase="please review my pull request" chapterId={GYM} trainerId="gym-wordorder" />
        </Card>
        <Card name="Предскажи вывод" chapter="kotlin-vars">
          <PredictOutput expected="14" code={PREDICT_CODE} chapterId={GYM} trainerId="gym-predict" />
        </Card>
      </section>
    </div>
  );
}
