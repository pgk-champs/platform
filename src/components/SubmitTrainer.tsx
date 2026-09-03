import React, { useState } from 'react';
import { SUBMIT_URL } from './CommunityCatalog';
import './trainers.css';

// Тренировка сабмита в каталог сообщества (пакет beginners, волна 7): форма
// как настоящая issue-форма «Материал в каталог сообщества», но кнопка
// «Проверить» гоняет валидацию ЛОКАЛЬНО, ничего никуда не отправляя.
// Правила и тексты ошибок продублированы 1-в-1 из
// leaderboard/scripts/validate-content.mjs — студент видит те же сообщения,
// что написал бы бот. Типы и подписи — из формы
// leaderboard/.github/ISSUE_TEMPLATE/submit-content.yml (preset, repo, link,
// video, source): расходиться этим трём файлам нельзя. Секретный код тренажёр НЕ проверяет (его знает только
// бот) — только напоминает, что поле должно быть заполнено.

export type SubmissionDraft = {
  type: 'preset' | 'repo' | 'link' | 'video' | 'source';
  title: string;
  chapter: string;
  dataRaw: string;
};

const TYPES: SubmissionDraft['type'][] = ['preset', 'repo', 'link', 'video', 'source'];
const YOUTUBE_HOST = /^(www\.|m\.)?(youtube\.com|youtu\.be)$/;

const str = (v: unknown) => typeof v === 'string' && v.trim() !== '';

// Возвращает список причин отказа — пустой список значит «бот бы принял».
// Копия правил validate-content.mjs (без секретного кода и автора).
export function validateSubmission({ type, title, chapter, dataRaw }: SubmissionDraft): string[] {
  const reasons: string[] = [];
  if (!TYPES.includes(type)) reasons.push('Тип должен быть preset, repo, link, video или source.');
  if (!title.trim()) reasons.push('Заголовок не может быть пустым.');
  if (title.trim().length > 120) reasons.push('Заголовок длиннее 120 символов.');
  if (chapter.trim().length > 100) reasons.push('Глава длиннее 100 символов.');
  if (chapter.trim() && !/^[a-z0-9-]+$/.test(chapter.trim()))
    reasons.push('Глава должна быть коротким id главы: строчные латинские буквы, цифры и дефис (например git-first-commit), без раздела и номера.');
  if (dataRaw.length > 20000) reasons.push('Данные больше 20 КБ — каталог такое не примет.');

  if (type === 'preset') {
    let p: Record<string, unknown> | undefined;
    try {
      p = JSON.parse(dataRaw);
    } catch {
      reasons.push('Данные пресета — не валидный JSON.');
    }
    if (p) {
      switch (p.engine) {
        case 'flashcards': {
          const cards = p.cards as { term?: unknown; translation?: unknown }[] | undefined;
          if (!Array.isArray(cards) || cards.length === 0 || cards.some((c) => !str(c?.term) || !str(c?.translation))) {
            reasons.push('flashcards: нужен непустой массив cards из объектов {term, translation}.');
          }
          break;
        }
        case 'wordorder':
          if (!str(p.phrase) || (p.phrase as string).trim().split(/\s+/).length < 2) {
            reasons.push('wordorder: phrase должна содержать минимум два слова.');
          }
          break;
        case 'codetyping': {
          const snippets = p.snippets as unknown[] | undefined;
          if (!Array.isArray(snippets) || snippets.length === 0 || snippets.some((s) => !str(s))) {
            reasons.push('codetyping: нужен непустой массив snippets из непустых строк.');
          }
          break;
        }
        case 'predict':
          if (!str(p.code) || !str(p.expected)) {
            reasons.push('predict: нужны непустые поля code и expected.');
          }
          break;
        default:
          reasons.push('engine должен быть одним из: flashcards, wordorder, codetyping, predict.');
      }
    }
  } else {
    let url: URL | undefined;
    try {
      url = new URL(dataRaw.trim());
    } catch {
      /* ниже */
    }
    if (!url || url.protocol !== 'https:') {
      reasons.push('Для repo, link, video и source данные — это один https-адрес.');
    } else if (type === 'video' && !YOUTUBE_HOST.test(url.hostname)) {
      reasons.push('video: ссылка должна вести на YouTube (youtube.com или youtu.be).');
    }
  }
  return reasons;
}

const PLACEHOLDERS: Record<SubmissionDraft['type'], string> = {
  preset: '{"engine": "wordorder", "phrase": "please review my pull request"}',
  repo: 'https://github.com/твой-логин/твой-репозиторий',
  link: 'https://адрес-полезной-страницы',
  video: 'https://www.youtube.com/watch?v=...',
  source: 'https://адрес-статьи-или-документации',
};

type Result = { reasons: string[] } | null;

export default function SubmitTrainer() {
  const [type, setType] = useState<SubmissionDraft['type']>('preset');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [dataRaw, setDataRaw] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [codeEmpty, setCodeEmpty] = useState(false);

  const check = () => {
    setCodeEmpty(code.trim() === '');
    setResult({ reasons: validateSubmission({ type, title, chapter, dataRaw }) });
  };

  const passed = result !== null && result.reasons.length === 0;

  return (
    <div className="st">
      <p className="st-note">
        Это тренировка: кнопка «Проверить» гоняет те же правила, что и бот на настоящей форме, но
        никуда ничего не отправляет. Заполняй смело — ошибиться здесь безопасно.
      </p>
      <label className="st-field">
        Секретный код
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="код от наставника"
          autoComplete="off"
        />
        <span className="st-help">Настоящий код проверяет только бот. Тренажёру хватит любого непустого.</span>
      </label>
      <label className="st-field">
        Тип
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as SubmissionDraft['type']);
            setResult(null);
          }}
        >
          <option value="preset">preset — набор для тренажёра из конструктора /gym</option>
          <option value="repo">repo — ссылка на свой репозиторий</option>
          <option value="link">link — полезная ссылка или инструмент</option>
          <option value="video">video — YouTube-видео или курс по теме главы</option>
          <option value="source">source — статья или документация по теме главы</option>
        </select>
      </label>
      <label className="st-field">
        Заголовок
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Словарь недели 3"
        />
      </label>
      <label className="st-field">
        Глава (необязательно)
        <input
          type="text"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="it-english"
        />
      </label>
      <label className="st-field">
        Данные (JSON)
        <textarea
          rows={5}
          value={dataRaw}
          onChange={(e) => setDataRaw(e.target.value)}
          placeholder={PLACEHOLDERS[type]}
        />
      </label>
      <button type="button" className="button button--primary" onClick={check}>
        Проверить
      </button>

      {result !== null ? (
        passed ? (
          <div className="st-result st-ok" role="status">
            <p>
              <strong>✅ Прошло бы проверку!</strong> Бот принял бы такую заявку и опубликовал
              материал в каталоге.
            </p>
            {codeEmpty ? (
              <p>Только не забудь: в настоящей форме поле «Секретный код» обязательное.</p>
            ) : null}
            <a className="button button--secondary" href={SUBMIT_URL} target="_blank" rel="noreferrer">
              Теперь по-настоящему →
            </a>
          </div>
        ) : (
          <div className="st-result st-no" role="status">
            <p>
              <strong>❌ Вот что бот бы ответил:</strong>
            </p>
            <ul>
              {result.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p>Исправь и нажми «Проверить» ещё раз — здесь можно сколько угодно.</p>
          </div>
        )
      ) : null}
    </div>
  );
}
