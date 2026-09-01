import React, { useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

const FIRST_XP = 10;
const FLAWLESS_XP = 15;

export type IdeTourProps = {
  /** Опциональны вместе: без них викторина работает, но ничего не пишет в store. */
  chapterId?: string;
  trainerId?: string;
};

type ZoneId = 'toolbar' | 'project' | 'editor' | 'gradle' | 'terminal' | 'logcat';

type Zone = { id: ZoneId; title: string; desc: string };

// Тексты — конспект раздела «Окно Android Studio: что где» главы 08.
const ZONES: Zone[] = [
  {
    id: 'toolbar',
    title: 'Тулбар с Run',
    desc:
      'Верхняя панель инструментов. Здесь выпадающий список устройств — в нём выбираешь AVD, ' +
      'на который ставить сборку, — и зелёный треугольник ▶ Run (Shift+F10): Android Studio ' +
      'соберёт проект, запустит эмулятор и установит туда приложение.',
  },
  {
    id: 'project',
    title: 'Project — дерево файлов',
    desc:
      'Панель слева показывает файлы проекта. По умолчанию открыта в режиме Android — это не настоящая ' +
      'структура на диске, а группировка по смыслу: manifests (AndroidManifest.xml — файл-паспорт приложения), ' +
      'kotlin+java (весь код, который ты пишешь), res (всё, что не код: строки, картинки, цвета) и ' +
      'Gradle Scripts (файлы сборки). Режим Project показывает настоящую структуру папок на диске.',
  },
  {
    id: 'editor',
    title: 'Редактор',
    desc:
      'Центр экрана — главное место в IDE, где ты пишешь и читаешь код. Подсвечивает синтаксис, ' +
      'подчёркивает ошибки красной волнистой линией ещё до сборки, а предупреждения — жёлтой. ' +
      'Слева от строк — узкая полоса gutter: номера строк, точки останова отладчика и зелёные ▶ ' +
      'рядом с функциями, которые можно запустить одним кликом.',
  },
  {
    id: 'gradle',
    title: 'Панель Gradle',
    desc:
      'Узкая вертикальная вкладка справа. Развернёшь — увидишь дерево задач сборки: build, assembleDebug, ' +
      'test и десятки других, каждую можно запустить кликом в обход кнопки Run. Здесь же кнопка обновления, ' +
      'которой можно вручную запустить синхронизацию проекта.',
  },
  {
    id: 'terminal',
    title: 'Terminal',
    desc:
      'Обычный терминал Linux (bash или zsh), встроенный прямо в IDE. Всё, что умеет система, работает ' +
      'и здесь — git, ls, ./gradlew — без переключения между окнами. Команды из глав про Linux и Git ' +
      'выполняются ровно в этой панели.',
  },
  {
    id: 'logcat',
    title: 'Logcat',
    desc:
      'Журнал запущенного приложения: сюда оно построчно пишет, что с ним происходит, сюда же падают ' +
      'сообщения об ошибках и полные трассировки крашей. Первое место, куда смотрят, когда «приложение ' +
      'просто закрылось»: причина почти всегда написана здесь открытым текстом — прокрути к красной строке.',
  },
];

// Порядок вопросов викторины — не совпадает с порядком чтения схемы,
// чтобы отвечали по памяти, а не по инерции.
const QUIZ_ORDER: ZoneId[] = ['logcat', 'project', 'gradle', 'terminal', 'toolbar', 'editor'];

const byId = (id: ZoneId): Zone => ZONES.find((z) => z.id === id)!;

export default function IdeTour({ chapterId, trainerId }: IdeTourProps) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [mode, setMode] = useState<'explore' | 'quiz'>('explore');
  const [selected, setSelected] = useState<ZoneId | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const quizDone = mode === 'quiz' && qIndex >= QUIZ_ORDER.length;
  const target = mode === 'quiz' && !quizDone ? QUIZ_ORDER[qIndex] : null;
  const found = mode === 'quiz' ? QUIZ_ORDER.slice(0, qIndex) : [];

  const startQuiz = () => {
    setMode('quiz');
    setSelected(null);
    setQIndex(0);
    setMistakes(0);
    setFeedback(null);
  };

  const complete = (finalMistakes: number) => {
    if (!chapterId || !trainerId) return;
    const prev = store.getProgress().trainers[chapterId]?.[trainerId];
    const prevMistakes = (prev?.result as { mistakes?: number } | undefined)?.mistakes;
    if (prevMistakes === undefined || finalMistakes < prevMistakes) {
      store.markTrainerDone(chapterId, trainerId, { total: QUIZ_ORDER.length, mistakes: finalMistakes });
    }
    if (!prev) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    if (finalMistakes === 0 && prevMistakes !== 0) {
      store.addXp(FLAWLESS_XP, `trainer-goal:${chapterId}:${trainerId}`);
    }
  };

  const onZoneClick = (id: ZoneId) => {
    if (mode === 'explore') {
      setSelected(id);
      return;
    }
    if (!target) return;
    if (id === target) {
      setFeedback({ kind: 'ok', text: `Верно! Это ${byId(id).title}.` });
      const next = qIndex + 1;
      setQIndex(next);
      if (next >= QUIZ_ORDER.length) complete(mistakes);
    } else {
      setMistakes((m) => m + 1);
      setFeedback({
        kind: 'err',
        text: `Это ${byId(id).title}, а найти нужно: ${byId(target).title}. Посмотри ещё раз.`,
      });
    }
  };

  const zoneProps = (id: ZoneId) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': byId(id).title,
    className: [
      'ide-zone',
      mode === 'explore' && selected === id ? 'ide-zone-selected' : '',
      found.includes(id) ? 'ide-zone-found' : '',
    ]
      .filter(Boolean)
      .join(' '),
    onClick: () => onZoneClick(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onZoneClick(id);
      }
    },
  });

  const selectedZone = selected ? byId(selected) : null;

  return (
    <div className="ide-tour">
      <div className="ide-mode-row">
        {mode === 'explore' ? (
          <>
            <p className="ide-mode-hint">Кликай по панелям схемы — узнаешь, что где живёт.</p>
            <button type="button" className="hk-btn" onClick={startQuiz}>
              Викторина: найди панель
            </button>
          </>
        ) : quizDone ? null : (
          <p className="ide-quiz-task" role="status">
            Покажи, где <strong>{byId(target!).title}</strong>{' '}
            <span className="ide-quiz-count">({qIndex + 1} из {QUIZ_ORDER.length})</span>
          </p>
        )}
      </div>

      <svg
        viewBox="0 0 820 520"
        className="ide-svg"
        role="img"
        aria-label="Упрощённая схема окна Android Studio"
      >
        {/* фон окна */}
        <rect x="0" y="0" width="820" height="520" rx="10" className="ide-window" />

        {/* Тулбар */}
        <g {...zoneProps('toolbar')}>
          <rect x="6" y="6" width="808" height="42" rx="6" className="ide-zone-bg" />
          <circle cx="24" cy="27" r="5" className="ide-deco-soft" />
          <circle cx="42" cy="27" r="5" className="ide-deco-soft" />
          <circle cx="60" cy="27" r="5" className="ide-deco-soft" />
          <rect x="520" y="14" width="150" height="26" rx="4" className="ide-deco-field" />
          <text x="532" y="32" className="ide-deco-text">Pixel API 24 ▾</text>
          <polygon points="690,17 690,37 708,27" className="ide-deco-run" />
          <text x="90" y="32" className="ide-zone-label">Тулбар с Run</text>
        </g>

        {/* Project */}
        <g {...zoneProps('project')}>
          <rect x="6" y="54" width="180" height="318" rx="6" className="ide-zone-bg" />
          <text x="16" y="76" className="ide-zone-label">Project</text>
          <rect x="16" y="90" width="120" height="8" rx="2" className="ide-deco-soft" />
          <rect x="28" y="106" width="110" height="8" rx="2" className="ide-deco-soft" />
          <rect x="28" y="122" width="90" height="8" rx="2" className="ide-deco-soft" />
          <rect x="40" y="138" width="100" height="8" rx="2" className="ide-deco-soft" />
          <rect x="28" y="154" width="80" height="8" rx="2" className="ide-deco-soft" />
        </g>

        {/* Редактор */}
        <g {...zoneProps('editor')}>
          <rect x="192" y="54" width="572" height="318" rx="6" className="ide-zone-bg" />
          <rect x="192" y="54" width="30" height="318" className="ide-deco-gutter" />
          <text x="199" y="120" className="ide-deco-text">12</text>
          <text x="199" y="150" className="ide-deco-text">13</text>
          <polygon points="200,166 200,178 210,172" className="ide-deco-run" />
          <rect x="236" y="90" width="220" height="10" rx="2" className="ide-deco-code" />
          <rect x="256" y="112" width="300" height="10" rx="2" className="ide-deco-soft" />
          <rect x="256" y="134" width="260" height="10" rx="2" className="ide-deco-soft" />
          <rect x="276" y="156" width="180" height="10" rx="2" className="ide-deco-code" />
          <rect x="276" y="178" width="230" height="10" rx="2" className="ide-deco-soft" />
          <path d="M 276 196 q 5 5 10 0 q 5 -5 10 0 q 5 5 10 0 q 5 -5 10 0" className="ide-deco-squiggle" />
          <text x="420" y="240" className="ide-zone-label ide-zone-label-center">Редактор</text>
        </g>

        {/* Gradle */}
        <g {...zoneProps('gradle')}>
          <rect x="768" y="54" width="46" height="318" rx="6" className="ide-zone-bg" />
          <text x="796" y="150" className="ide-zone-label" transform="rotate(90 796 150)">Gradle</text>
        </g>

        {/* Terminal */}
        <g {...zoneProps('terminal')}>
          <rect x="6" y="378" width="380" height="136" rx="6" className="ide-zone-bg" />
          <text x="16" y="400" className="ide-zone-label">Terminal</text>
          <text x="16" y="424" className="ide-deco-text">$ ./gradlew build</text>
          <text x="16" y="444" className="ide-deco-text">$ git status</text>
        </g>

        {/* Logcat */}
        <g {...zoneProps('logcat')}>
          <rect x="392" y="378" width="422" height="136" rx="6" className="ide-zone-bg" />
          <text x="402" y="400" className="ide-zone-label">Logcat</text>
          <rect x="402" y="412" width="320" height="8" rx="2" className="ide-deco-soft" />
          <rect x="402" y="428" width="280" height="8" rx="2" className="ide-deco-soft" />
          <rect x="402" y="444" width="340" height="8" rx="2" className="ide-deco-error" />
        </g>
      </svg>

      {mode === 'explore' && selectedZone && (
        <div className="ide-card" role="status">
          <p className="ide-card-title">{selectedZone.title}</p>
          <p className="ide-card-desc">{selectedZone.desc}</p>
        </div>
      )}

      {mode === 'quiz' && feedback && !quizDone && (
        <p className={`ide-feedback ${feedback.kind === 'ok' ? 'ide-feedback-ok' : 'ide-feedback-err'}`} role="status">
          {feedback.text}
        </p>
      )}

      {quizDone && (
        <div className="hk-result" role="status">
          <span className="hk-result-check" aria-hidden="true">✓</span>
          <p className="hk-result-title">Викторина пройдена! Все {QUIZ_ORDER.length} панелей на месте.</p>
          <p className="hk-result-sub">
            {mistakes === 0
              ? 'Ни одного промаха — окно IDE ты уже знаешь наизусть.'
              : `Промахов: ${mistakes}. Пройди ещё раз — запомнится накрепко.`}
          </p>
          <button type="button" className="hk-btn" onClick={startQuiz}>
            Ещё раз
          </button>
          <button type="button" className="hk-btn hk-btn-ghost" onClick={() => setMode('explore')}>
            Вернуться к изучению
          </button>
        </div>
      )}
    </div>
  );
}
