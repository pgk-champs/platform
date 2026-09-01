import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store, type CustomPreset, type CustomPresetData } from '../lib/store';
import Fold from './Fold';
import Flashcards from './Flashcards';
import WordOrder from './WordOrder';
import CodeTyping from './CodeTyping';
import PredictOutput from './PredictOutput';
import './trainers.css';

// Конструктор тренажёров (/gym): движки WordOrder / Flashcards / CodeTyping /
// PredictOutput со СВОИМИ данными. Пресеты сохраняются в store, «поделиться»
// сериализует пресет в URL-hash — наставник кидает студентам ссылку.

export type EngineId = CustomPresetData['engine'];

export const ENGINE_LABELS: Record<EngineId, string> = {
  flashcards: 'Карточки слов',
  wordorder: 'Собери фразу',
  codetyping: 'Печать',
  predict: 'Предскажи вывод',
};

// Пресет без служебных полей — то, что летит в ссылку.
export type SharedPreset = { name: string } & CustomPresetData;

// --- сериализация в URL-hash (юникод-safe base64, туда и обратно) ---

export function encodePreset(p: SharedPreset): string {
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(p)))));
}

export function decodePreset(encoded: string): SharedPreset | null {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(encoded)))));
    if (!obj || typeof obj.name !== 'string' || obj.name === '') return null;
    switch (obj.engine) {
      case 'flashcards':
        if (
          !Array.isArray(obj.cards) ||
          obj.cards.length === 0 ||
          obj.cards.some((c: unknown) => {
            const card = c as { term?: unknown; translation?: unknown };
            return typeof card?.term !== 'string' || typeof card?.translation !== 'string';
          })
        )
          return null;
        return { name: obj.name, engine: 'flashcards', cards: obj.cards };
      case 'wordorder':
        if (typeof obj.phrase !== 'string' || obj.phrase.trim().split(/\s+/).length < 2) return null;
        return { name: obj.name, engine: 'wordorder', phrase: obj.phrase };
      case 'codetyping':
        if (
          !Array.isArray(obj.snippets) ||
          obj.snippets.length === 0 ||
          obj.snippets.some((s: unknown) => typeof s !== 'string' || s === '')
        )
          return null;
        return { name: obj.name, engine: 'codetyping', snippets: obj.snippets };
      case 'predict':
        if (typeof obj.code !== 'string' || obj.code === '' || typeof obj.expected !== 'string' || obj.expected === '')
          return null;
        return { name: obj.name, engine: 'predict', code: obj.code, expected: obj.expected };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// --- валидация форм (дружелюбные ошибки по-русски) ---

export function parseCards(text: string): { cards?: { term: string; translation: string }[]; error?: string } {
  const lines = text.split('\n');
  const cards: { term: string; translation: string }[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = line.match(/^(.+?)\s*(?:—|–|\s-\s)\s*(.+)$/);
    if (!m) {
      return {
        error: `Строка ${i + 1}: нужен формат «слово — перевод» (разделитель — тире или дефис с пробелами).`,
      };
    }
    cards.push({ term: m[1].trim(), translation: m[2].trim() });
  }
  if (cards.length === 0) return { error: 'Добавь хотя бы одну карточку: «слово — перевод», каждая с новой строки.' };
  return { cards };
}

export function buildPresetData(
  engine: EngineId,
  form: { cardsText: string; phrase: string; snippetsText: string; code: string; expected: string },
): { data?: CustomPresetData; error?: string } {
  switch (engine) {
    case 'flashcards': {
      const parsed = parseCards(form.cardsText);
      if (parsed.error) return { error: parsed.error };
      return { data: { engine: 'flashcards', cards: parsed.cards! } };
    }
    case 'wordorder': {
      const words = form.phrase.trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) return { error: 'Нужно минимум два слова — иначе нечего собирать.' };
      return { data: { engine: 'wordorder', phrase: words.join(' ') } };
    }
    case 'codetyping': {
      const snippets = form.snippetsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (snippets.length === 0) return { error: 'Добавь хотя бы одну строку для печати (каждая строка — отдельный фрагмент).' };
      return { data: { engine: 'codetyping', snippets } };
    }
    case 'predict': {
      if (!form.code.trim()) return { error: 'Вставь код, вывод которого надо предсказать.' };
      if (!form.expected.trim()) return { error: 'Укажи ожидаемый вывод — с ним сравнивается ответ студента.' };
      return { data: { engine: 'predict', code: form.code, expected: form.expected.trim() } };
    }
    default:
      return { error: 'Неизвестный движок.' };
  }
}

export function presetUrl(p: SharedPreset): string {
  return `${window.location.origin}${window.location.pathname}#preset=${encodePreset(p)}`;
}

// Запуск движка с данными пресета. Без chapterId/trainerId — зал не трогает
// прогресс глав, а свои данные не должны фармить XP.
function RunPreset({ preset }: { preset: SharedPreset }) {
  switch (preset.engine) {
    case 'flashcards':
      return <Flashcards cards={preset.cards} />;
    case 'wordorder':
      return <WordOrder phrase={preset.phrase} />;
    case 'codetyping':
      return <CodeTyping pools={[{ label: preset.name, snippets: preset.snippets }]} />;
    case 'predict':
      return <PredictOutput expected={preset.expected} code={preset.code} />;
    default:
      return null;
  }
}

const EMPTY_FORM = { cardsText: '', phrase: '', snippetsText: '', code: '', expected: '' };

export default function GymBuilder() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [engine, setEngine] = useState<EngineId>('flashcards');
  const [form, setForm] = useState(EMPTY_FORM);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [running, setRunning] = useState<SharedPreset | null>(null);
  const [runKey, setRunKey] = useState(0);
  // Пресет из ссылки #preset=... — баннер «Вам передали набор».
  const [shared, setShared] = useState<SharedPreset | null>(null);
  const [sharedBroken, setSharedBroken] = useState(false);

  // Hash читается только на клиенте (useEffect не зовётся при SSR-сборке).
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#preset=')) return;
    const decoded = decodePreset(hash.slice('#preset='.length));
    if (decoded) setShared(decoded);
    else setSharedBroken(true);
  }, []);

  const set = (patch: Partial<typeof EMPTY_FORM>) => setForm((f) => ({ ...f, ...patch }));

  const launch = (preset: SharedPreset) => {
    setRunning(preset);
    setRunKey((k) => k + 1);
    setNotice('');
  };

  const buildFromForm = (): SharedPreset | null => {
    const { data, error: err } = buildPresetData(engine, form);
    if (!data) {
      setError(err ?? 'Не получилось разобрать данные.');
      return null;
    }
    setError('');
    return { name: name.trim() || 'Свой набор', ...data };
  };

  const runFromForm = () => {
    const preset = buildFromForm();
    if (preset) launch(preset);
  };

  const saveFromForm = () => {
    if (!name.trim()) {
      setError('Дай набору имя — по нему он найдётся в списке пресетов.');
      return;
    }
    const preset = buildFromForm();
    if (!preset) return;
    const { name: n, ...data } = preset;
    store.customPresets.add({ name: n, ...data });
    setNotice(`Набор «${n}» сохранён — он в списке «Мои пресеты» ниже.`);
  };

  const share = async (p: SharedPreset) => {
    const url = presetUrl(p);
    try {
      await navigator.clipboard.writeText(url);
      setNotice(`Ссылка на набор «${p.name}» скопирована — кидай студентам.`);
    } catch {
      setNotice(`Скопируй ссылку вручную: ${url}`);
    }
  };

  const saveShared = () => {
    if (!shared) return;
    store.customPresets.add(shared);
    setNotice(`Набор «${shared.name}» сохранён в «Мои пресеты».`);
    setShared(null);
  };

  const presets = store.customPresets.list();

  return (
    <section className="gym-section gb">
      <h2>Конструктор тренажёров</h2>
      {shared ? (
        <div className="gb-banner" role="status">
          <span>
            Вам передали набор «{shared.name}» ({ENGINE_LABELS[shared.engine]})
          </span>
          <span className="gb-banner-actions">
            <button type="button" className="button button--sm button--primary" onClick={() => launch(shared)}>
              Запустить
            </button>
            <button type="button" className="button button--sm button--secondary" onClick={saveShared}>
              Сохранить себе
            </button>
          </span>
        </div>
      ) : null}
      {sharedBroken ? (
        <div className="gb-banner gb-banner-broken" role="status">
          Ссылка с набором повреждена — попроси наставника прислать её ещё раз.
        </div>
      ) : null}
      <p>
        Любой движок зала можно запустить со своими данными: собери набор, сохрани его как пресет и
        поделись ссылкой — тот, кто её откроет, получит твой набор готовым к запуску.
      </p>
      <Fold title="Создать свой тренажёр">
        <div className="gb-form">
          <div className="gb-tabs" role="tablist" aria-label="Движок">
            {(Object.keys(ENGINE_LABELS) as EngineId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`button button--sm ${engine === id ? 'button--primary' : 'button--secondary'}`}
                onClick={() => {
                  setEngine(id);
                  setError('');
                }}
              >
                {ENGINE_LABELS[id]}
              </button>
            ))}
          </div>
          {engine === 'flashcards' ? (
            <label className="gb-field">
              Слова, по одному на строку, в формате «слово — перевод»:
              <textarea
                rows={5}
                value={form.cardsText}
                placeholder={'pull request — запрос на слияние\nbranch — ветка'}
                onChange={(e) => set({ cardsText: e.target.value })}
              />
            </label>
          ) : null}
          {engine === 'wordorder' ? (
            <label className="gb-field">
              Фраза, которую студент соберёт из перемешанных слов:
              <textarea
                rows={2}
                value={form.phrase}
                placeholder="please review my pull request"
                onChange={(e) => set({ phrase: e.target.value })}
              />
            </label>
          ) : null}
          {engine === 'codetyping' ? (
            <label className="gb-field">
              Фрагменты для печати, каждая строка — отдельный фрагмент:
              <textarea
                rows={5}
                value={form.snippetsText}
                placeholder={'val greeting = "Привет"\ngit commit -m "fix: опечатка"'}
                onChange={(e) => set({ snippetsText: e.target.value })}
              />
            </label>
          ) : null}
          {engine === 'predict' ? (
            <>
              <label className="gb-field">
                Код:
                <textarea
                  rows={5}
                  value={form.code}
                  placeholder={'fun main() {\n    println(2 + 2)\n}'}
                  onChange={(e) => set({ code: e.target.value })}
                />
              </label>
              <label className="gb-field">
                Ожидаемый вывод:
                <textarea rows={2} value={form.expected} placeholder="4" onChange={(e) => set({ expected: e.target.value })} />
              </label>
            </>
          ) : null}
          <label className="gb-field">
            Имя набора (нужно для сохранения и ссылки):
            <input
              type="text"
              value={name}
              placeholder="Словарь недели 3"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {error ? <p className="gb-error">{error}</p> : null}
          <div className="gb-actions">
            <button type="button" className="button button--sm button--primary" onClick={runFromForm}>
              Запустить
            </button>
            <button type="button" className="button button--sm button--secondary" onClick={saveFromForm}>
              Сохранить пресет
            </button>
          </div>
        </div>
      </Fold>
      {presets.length > 0 ? (
        <div className="gb-presets">
          <h3>Мои пресеты</h3>
          {presets.map((p: CustomPreset) => (
            <div key={p.id} className="gb-preset-row">
              <span className="gb-preset-name">{p.name}</span>
              <span className="gb-preset-engine">{ENGINE_LABELS[p.engine]}</span>
              <span className="gb-preset-actions">
                <button type="button" className="button button--sm button--primary" onClick={() => launch(p)}>
                  Запустить
                </button>
                <button type="button" className="button button--sm button--secondary" onClick={() => share(p)}>
                  Поделиться
                </button>
                <button
                  type="button"
                  className="button button--sm button--secondary"
                  onClick={() => store.customPresets.remove(p.id)}
                  aria-label={`Удалить набор ${p.name}`}
                >
                  Удалить
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {notice ? <p className="gb-notice" role="status">{notice}</p> : null}
      {running ? (
        <div className="gb-run">
          <h3>Запущено: «{running.name}»</h3>
          <RunPreset key={runKey} preset={running} />
        </div>
      ) : null}
    </section>
  );
}
