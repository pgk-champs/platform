import React, { useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

const XP_SOLVE = 10;

// Словарь главы: 40 пар из Flashcards-блоков + слова из разборов ошибок.
const DICT: Record<string, string> = {
  // действия программ
  create: 'создать',
  open: 'открыть',
  save: 'сохранить',
  delete: 'удалить',
  run: 'запустить',
  build: 'собрать',
  test: 'проверить, тестировать',
  fail: 'провалиться, упасть',
  error: 'ошибка',
  warning: 'предупреждение',
  // файлы и система
  file: 'файл',
  folder: 'папка',
  directory: 'каталог',
  path: 'путь',
  package: 'пакет',
  install: 'установить',
  update: 'обновить',
  version: 'версия',
  settings: 'настройки',
  terminal: 'терминал',
  // слова из кода
  variable: 'переменная',
  function: 'функция',
  value: 'значение',
  type: 'тип',
  string: 'строка (текст)',
  number: 'число',
  list: 'список',
  loop: 'цикл',
  condition: 'условие',
  comment: 'комментарий',
  // глаголы git и терминала
  commit: 'зафиксировать (изменения); коммит',
  push: 'отправить',
  pull: 'забрать',
  merge: 'слияние; слить',
  branch: 'ветка',
  clone: 'клонировать',
  fetch: 'скачать (без слияния)',
  add: 'добавить (в индекс)',
  status: 'состояние, статус',
  log: 'журнал (истории коммитов)',
  // из разборов ошибок этой главы
  no: 'нет, никакого',
  such: 'такой, подобный',
  or: 'или',
  not: 'не',
  found: 'найдена (от to find)',
  permission: 'разрешение',
  denied: 'отказано (от to deny)',
  command: 'команда',
  fatal: 'фатально',
  repository: 'репозиторий',
  parent: 'родительский',
  any: 'любой',
};

// Готовые ошибки из главы.
const EXAMPLES = [
  'cat: report.txt: No such file or directory',
  'bash: ./run_tests.sh: Permission denied',
  'fatal: not a git repository (or any of the parent directories): .git',
];

type Kind = 'known' | 'word' | 'service';
type Token = { raw: string; core: string; kind: Kind; translation?: string };

function lookup(core: string): string | undefined {
  const w = core.toLowerCase();
  if (DICT[w]) return DICT[w];
  // ponytail: наивное снятие множественного числа (directories → directory)
  if (w.endsWith('ies')) return DICT[`${w.slice(0, -3)}y`];
  if (w.endsWith('s')) return DICT[w.slice(0, -1)];
  return undefined;
}

function classify(raw: string): Token {
  // Ведущую точку/тильду не срезаем — это признак пути (./x.sh, ~/docs, .git).
  const core = raw.replace(/^["'«»(),;!?]+/, '').replace(/["'«»(),.:;!?]+$/, '');
  if (!core || !/[a-zа-яё]/i.test(core)) return { raw, core, kind: 'service' };
  if (core.includes('/') || core.startsWith('.') || core.startsWith('~') || /\w\.\w/.test(core)) {
    return { raw, core, kind: 'service' };
  }
  const translation = lookup(core);
  return translation ? { raw, core, kind: 'known', translation } : { raw, core, kind: 'word' };
}

export type ErrorTranslatorProps = {
  /** Вместе включают запись прогресса и XP. */
  chapterId?: string;
  trainerId?: string;
};

// «Переводчик ошибок»: вставь сообщение об ошибке — знакомые слова из словаря
// главы подсветятся, по клику/наведению покажут перевод; пути и знаки — приглушены.
export default function ErrorTranslator({ chapterId, trainerId }: ErrorTranslatorProps) {
  const [text, setText] = useState('');
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [gotXp, setGotXp] = useState(false);

  const parse = (source: string) => {
    const next = source.split(/\s+/).filter(Boolean).map(classify);
    setTokens(next);
    setSel(null);
    const known = next.filter((t) => t.kind === 'known').length;
    if (known > 0 && !solved) {
      setSolved(true);
      if (chapterId && trainerId) {
        const words = next.filter((t) => t.kind !== 'service').length;
        const first = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { known, words });
        if (first) {
          store.addXp(XP_SOLVE, `errortranslator:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    }
  };

  const words = tokens?.filter((t) => t.kind !== 'service') ?? [];
  const known = words.filter((t) => t.kind === 'known').length;
  const selected = sel !== null && tokens ? tokens[sel] : null;

  return (
    <div className="et">
      <textarea
        className="et-input"
        rows={3}
        placeholder="Вставь сообщение об ошибке…"
        aria-label="Сообщение об ошибке"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="et-controls">
        <button type="button" className="et-parse" disabled={!text.trim()} onClick={() => parse(text)}>
          Разобрать
        </button>
        <span className="et-examples-label">или возьми готовое:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="et-example"
            onClick={() => {
              setText(ex);
              parse(ex);
            }}
          >
            {ex.length > 30 ? `${ex.slice(0, 30)}…` : ex}
          </button>
        ))}
      </div>
      {tokens && (
        <>
          <div className="et-out" aria-label="Разобранное сообщение">
            {tokens.map((t, i) =>
              t.kind === 'known' ? (
                <button
                  key={i}
                  type="button"
                  className={`et-token et-known${sel === i ? ' et-sel' : ''}`}
                  title={t.translation}
                  onClick={() => setSel(sel === i ? null : i)}
                >
                  {t.raw}
                </button>
              ) : (
                <span key={i} className={`et-token${t.kind === 'service' ? ' et-service' : ''}`}>
                  {t.raw}
                </span>
              ),
            )}
          </div>
          {selected && (
            <p className="et-translation">
              <strong>{selected.core.toLowerCase()}</strong> — {selected.translation}
            </p>
          )}
          <p className="et-count">
            Знакомых слов: {known} из {words.length}
          </p>
          {solved && <div className="et-done">{`Выполнено!${gotXp ? ' · +10 XP' : ''}`}</div>}
        </>
      )}
    </div>
  );
}
