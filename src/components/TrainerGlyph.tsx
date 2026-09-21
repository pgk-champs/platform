import React from 'react';

// Глифы механик для карточек Зала. Не по рисунку на каждую из 46, а десять
// СЕМЕЙСТВ по роду упражнения: на 22 пикселях сорок шесть уникальных значков
// не информативнее десяти, зато список стал бы неподъёмным и разъехался бы
// при первой же новой механике.
//
// Рисуются одним контуром в currentColor: цвет и толщина приходят от
// карточки, тем и светлая тема не требует отдельного набора.

export type GlyphId =
  | 'keyboard'
  | 'terminal'
  | 'git'
  | 'code'
  | 'screen'
  | 'chain'
  | 'words'
  | 'graph'
  | 'quest'
  | 'ide';

/** Что означает каждое семейство — чтобы назначать новые механики осознанно. */
export const GLYPH_MEANING: Record<GlyphId, string> = {
  keyboard: 'набор текста и команд вслепую',
  terminal: 'командная строка, файлы и права',
  git: 'история, коммиты, ветки, ревью',
  code: 'чтение и разбор кода',
  screen: 'экран приложения и его вёрстка',
  chain: 'криптография и блокчейн',
  words: 'язык, слова и перевод',
  graph: 'связи: модули, зависимости, сервисы',
  quest: 'правильный порядок шагов',
  ide: 'среда разработки и работа в ней',
};

const PATHS: Record<GlyphId, React.ReactNode> = {
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 15h8" />
    </>
  ),
  terminal: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 9l3 3-3 3M13 15h5" />
    </>
  ),
  git: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M6 8.5v7M8.5 6h4a3 3 0 013 3v.5" />
    </>
  ),
  code: (
    <>
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13 5l-2 14" />
    </>
  ),
  screen: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M9 6h6M9 10h6M9 14h3" />
    </>
  ),
  chain: (
    <>
      <rect x="2" y="9" width="6" height="6" rx="1" />
      <rect x="16" y="9" width="6" height="6" rx="1" />
      <path d="M8 12h8" />
    </>
  ),
  words: (
    <>
      <path d="M3 5h10M8 5v14M14 12h7M17.5 9l-3.5 3 3.5 3" />
    </>
  ),
  graph: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M11 7.5L6.5 16.5M13 7.5l4.5 9M7.5 19h9" />
    </>
  ),
  quest: (
    <>
      <path d="M4 6h10M4 12h13M4 18h7" />
      <path d="M17 4l3 3-3 3" />
    </>
  ),
  ide: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 9h20M7 4v5M6 14h5" />
    </>
  ),
};

export default function TrainerGlyph({ id }: { id: GlyphId }): React.ReactElement {
  return (
    <svg
      className="gc-glyph"
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={GLYPH_MEANING[id]}
    >
      {PATHS[id]}
    </svg>
  );
}
