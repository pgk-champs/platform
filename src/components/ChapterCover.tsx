import React from 'react';

type Track = 'foundation' | 'mobile' | 'blockchain';

const TRACK_LABEL: Record<Track, string> = {
  foundation: 'Фундамент',
  mobile: 'Мобилка',
  blockchain: 'Блокчейн',
};

const ACCENT = 'var(--ifm-color-primary-lightest)';
const DARK = 'var(--ifm-color-primary-darkest)';
const INK = 'rgba(255,255,255,0.9)';
const SOFT = 'rgba(255,255,255,0.14)';
const MONO = 'var(--ifm-font-family-monospace)';

/* Каждая иллюстрация рисуется в поле 200x180 (правая часть обложки). */
const ARTS: Record<string, () => React.ReactNode> = {
  typing: () => (
    <g transform="rotate(-3 100 95)" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round">
      <rect x="8" y="46" width="184" height="96" rx="14" fill={SOFT} />
      <path d="M26 72h148" strokeWidth={13} strokeDasharray="13 8" stroke="rgba(255,255,255,0.45)" />
      <path d="M26 96h148" strokeWidth={13} strokeDasharray="13 8" stroke="rgba(255,255,255,0.45)" />
      <rect x="58" y="112" width="84" height="14" rx="5" fill="rgba(255,255,255,0.45)" stroke="none" />
      <rect x="152" y="112" width="20" height="14" rx="5" fill={ACCENT} stroke="none" />
    </g>
  ),
  'it-english': () => (
    <g>
      <rect x="10" y="28" width="110" height="58" rx="16" fill={ACCENT} />
      <path d="M44 84l-6 22 24-20z" fill={ACCENT} />
      <text x="65" y="66" textAnchor="middle" fontSize="26" fontWeight={800} fill={DARK}>EN</text>
      <rect x="82" y="96" width="110" height="58" rx="16" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M160 152l8 20-26-16z" fill={SOFT} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <text x="137" y="134" textAnchor="middle" fontSize="26" fontWeight={800} fill="#fff">RU</text>
    </g>
  ),
  'english-practice': () => (
    <g>
      <path
        d="M100 74 C82 60 52 58 30 66 V138 C52 130 82 132 100 146 C118 132 148 130 170 138 V66 C148 58 118 60 100 74 Z"
        fill={SOFT} stroke={INK} strokeWidth={3} strokeLinejoin="round"
      />
      <path d="M100 74v72" stroke={INK} strokeWidth={3} />
      <path d="M46 80a54 54 0 0 1 108 0" stroke={ACCENT} strokeWidth={6} fill="none" />
      <rect x="36" y="76" width="18" height="32" rx="8" fill={ACCENT} />
      <rect x="146" y="76" width="18" height="32" rx="8" fill={ACCENT} />
    </g>
  ),
  'linux-terminal': () => (
    <g strokeLinecap="round">
      <rect x="12" y="32" width="176" height="122" rx="12" fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={3} />
      <path d="M12 58h176" stroke={INK} strokeWidth={2} opacity={0.5} />
      <circle cx="30" cy="45" r="4.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="46" cy="45" r="4.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="62" cy="45" r="4.5" fill={ACCENT} />
      <text x="28" y="94" fontSize="26" fontWeight={700} fill={ACCENT} fontFamily={MONO}>$</text>
      <rect x="48" y="76" width="13" height="20" fill="rgba(255,255,255,0.85)" />
      <path d="M28 118h70M28 134h44" stroke="rgba(255,255,255,0.4)" strokeWidth={6} />
    </g>
  ),
  'files-packages-ssh': () => (
    <g strokeLinecap="round">
      <path d="M66 84V64a34 34 0 0 1 68 0v20" stroke={INK} strokeWidth={7} fill="none" />
      <rect x="52" y="84" width="96" height="72" rx="14" fill={SOFT} stroke={INK} strokeWidth={3} />
      <circle cx="100" cy="112" r="9" fill={ACCENT} />
      <rect x="96" y="116" width="8" height="22" rx="4" fill={ACCENT} />
      <circle cx="26" cy="36" r="11" stroke={INK} strokeWidth={5} fill="none" />
      <path d="M34 44l26 26M48 58l-7 7M58 68l-7 7" stroke={INK} strokeWidth={5} fill="none" />
    </g>
  ),
  'git-first-commit': () => (
    <g>
      <path d="M14 118h172" stroke="rgba(255,255,255,0.45)" strokeWidth={5} strokeLinecap="round" />
      <circle cx="48" cy="118" r="13" fill="none" stroke={INK} strokeWidth={5} />
      <circle cx="100" cy="118" r="13" fill="none" stroke={INK} strokeWidth={5} />
      <circle cx="152" cy="118" r="16" fill={ACCENT} />
      <rect x="122" y="52" width="60" height="30" rx="8" fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <path d="M152 82v16" stroke={INK} strokeWidth={2.5} />
      <text x="152" y="73" textAnchor="middle" fontSize="16" fontWeight={700} fill="#fff" fontFamily={MONO}>#1</text>
    </g>
  ),
  'git-branches': () => (
    <g fill="none" strokeLinecap="round">
      <path d="M28 132h150" stroke="rgba(255,255,255,0.5)" strokeWidth={5} />
      <path d="M76 132c26 0 20-62 48-62h50" stroke={ACCENT} strokeWidth={5} />
      <circle cx="40" cy="132" r="11" stroke={INK} strokeWidth={5} />
      <circle cx="76" cy="132" r="11" stroke={INK} strokeWidth={5} />
      <circle cx="124" cy="70" r="11" stroke={ACCENT} strokeWidth={5} />
      <circle cx="174" cy="70" r="12" fill={ACCENT} />
    </g>
  ),
  'git-remote': () => (
    <g strokeLinecap="round">
      <g fill={SOFT}>
        <rect x="14" y="120" width="86" height="34" rx="17" />
        <circle cx="42" cy="116" r="18" />
        <circle cx="70" cy="110" r="22" />
      </g>
      <g fill={ACCENT} opacity={0.9}>
        <rect x="100" y="40" width="86" height="34" rx="17" />
        <circle cx="128" cy="36" r="18" />
        <circle cx="156" cy="30" r="22" />
      </g>
      <path d="M70 96l36-28M106 68l-12 1m12-1l-1 12" stroke={ACCENT} strokeWidth={5} fill="none" />
      <path d="M130 82l-36 28M94 110l12-1m-12 1l1-12" stroke={INK} strokeWidth={5} fill="none" />
    </g>
  ),
  'android-studio': () => (
    <g strokeLinecap="round">
      <rect x="34" y="26" width="86" height="140" rx="16" fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={3} />
      <path d="M64 42h26" stroke={INK} strokeWidth={4} />
      <rect x="48" y="56" width="58" height="76" rx="8" fill={SOFT} />
      <circle cx="77" cy="150" r="6" stroke={INK} strokeWidth={3} fill="none" />
      <circle cx="152" cy="120" r="30" fill="none" stroke={ACCENT} strokeWidth={13} strokeDasharray="10 8.85" />
      <circle cx="152" cy="120" r="22" fill="none" stroke={ACCENT} strokeWidth={6} />
      <circle cx="152" cy="120" r="9" fill="none" stroke={INK} strokeWidth={4} />
    </g>
  ),
  'kotlin-vars': () => (
    <g>
      <rect x="14" y="64" width="76" height="58" rx="12" fill={ACCENT} />
      <text x="52" y="102" textAnchor="middle" fontSize="24" fontWeight={800} fill={DARK} fontFamily={MONO}>val</text>
      <path d="M44 62v-8a8 8 0 0 1 16 0v8" stroke={ACCENT} strokeWidth={4} fill="none" strokeLinecap="round" />
      <rect x="110" y="64" width="76" height="58" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="148" y="102" textAnchor="middle" fontSize="24" fontWeight={800} fill="#fff" fontFamily={MONO}>var</text>
      <path d="M158 52a12 12 0 1 1-3-14m3 14l2-9m-2 9l-9-2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  ),
  'functions-lambdas': () => (
    <g strokeLinecap="round">
      <text x="18" y="130" fontSize="88" fontWeight={800} fill={ACCENT} fontFamily={MONO}>λ</text>
      <text x="122" y="76" textAnchor="middle" fontSize="20" fill="rgba(255,255,255,0.6)" fontFamily={MONO}>(x)</text>
      <path d="M92 98h72" stroke={INK} strokeWidth={6} />
      <path d="M164 98l-16-10m16 10l-16 10" stroke={INK} strokeWidth={6} fill="none" />
      <circle cx="180" cy="98" r="8" fill={ACCENT} />
    </g>
  ),
  'classes-collections': () => (
    <g strokeLinecap="round">
      <rect x="44" y="84" width="120" height="76" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
      <rect x="32" y="66" width="120" height="76" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
      <rect x="20" y="48" width="120" height="76" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M22 76h116" stroke={INK} strokeWidth={3} />
      <circle cx="36" cy="62" r="5" fill={ACCENT} />
      <path d="M34 94h72M34 108h48" stroke="rgba(255,255,255,0.45)" strokeWidth={6} />
    </g>
  ),
  'first-compose-screen': () => (
    <g>
      <rect x="56" y="16" width="88" height="152" rx="18" fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={3} />
      <rect x="68" y="34" width="64" height="22" rx="6" fill={ACCENT} />
      <rect x="68" y="64" width="64" height="34" rx="6" fill={SOFT} />
      <rect x="68" y="106" width="64" height="12" rx="6" fill="rgba(255,255,255,0.3)" />
      <rect x="68" y="124" width="44" height="12" rx="6" fill="rgba(255,255,255,0.3)" />
      <circle cx="122" cy="150" r="11" fill={ACCENT} />
    </g>
  ),
  'state-events': () => (
    <g strokeLinecap="round">
      <circle cx="86" cy="76" r="34" stroke="rgba(255,255,255,0.35)" strokeWidth={3} fill="none" />
      <circle cx="86" cy="76" r="18" stroke={INK} strokeWidth={3} fill="none" />
      <circle cx="86" cy="76" r="7" fill={ACCENT} />
      <rect x="102" y="86" width="30" height="86" rx="15" fill={SOFT} stroke={INK} strokeWidth={3} transform="rotate(-30 117 129)" />
      <path d="M50 38l10 10M86 24v14M122 38l-10 10" stroke={ACCENT} strokeWidth={4} fill="none" />
    </g>
  ),
  'layout-by-mockup': () => (
    <g>
      <rect x="20" y="28" width="160" height="128" rx="10" stroke={INK} strokeWidth={3} fill="rgba(255,255,255,0.06)" />
      <path d="M76 28v128M132 28v128" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="6 6" />
      <path d="M20 70h160M20 118h160" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="6 6" />
      <rect x="26" y="34" width="44" height="30" rx="5" fill={ACCENT} />
      <rect x="82" y="76" width="44" height="36" rx="5" fill={SOFT} />
    </g>
  ),
  'ui-kit': () => (
    <g strokeLinecap="round">
      <rect x="30" y="96" width="46" height="46" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="86" y="96" width="46" height="46" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="58" y="42" width="46" height="46" rx="10" fill={ACCENT} transform="rotate(-8 81 65)" />
      <path d="M148 58h20M158 48v20" stroke={ACCENT} strokeWidth={5} fill="none" />
    </g>
  ),
  'what-is-blockchain': () => (
    <g strokeLinecap="round">
      <rect x="14" y="68" width="48" height="52" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="76" y="68" width="48" height="52" rx="10" fill={ACCENT} />
      <rect x="138" y="68" width="48" height="52" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M62 94h14M124 94h14" stroke={INK} strokeWidth={7} />
      <text x="100" y="103" textAnchor="middle" fontSize="26" fontWeight={800} fill={DARK} fontFamily={MONO}>#</text>
      <path d="M26 86h24M26 100h16M150 86h24M150 100h16" stroke="rgba(255,255,255,0.45)" strokeWidth={4} />
    </g>
  ),
  'waves-first-network': () => (
    <g>
      <path d="M100 44L44 134M100 44l56 90M44 134h112" stroke="rgba(255,255,255,0.4)" strokeWidth={3} fill="none" />
      <circle cx="100" cy="44" r="16" fill={ACCENT} />
      <circle cx="100" cy="44" r="26" stroke={ACCENT} strokeWidth={2.5} fill="none" opacity={0.6} />
      <circle cx="44" cy="134" r="16" fill={SOFT} stroke={INK} strokeWidth={3} />
      <circle cx="156" cy="134" r="16" fill={SOFT} stroke={INK} strokeWidth={3} />
    </g>
  ),
  /* арт для баннера трека «Фундамент» (кирпичи-основание) */
  'track-foundation': () => (
    <g strokeLinecap="round">
      <rect x="24" y="118" width="72" height="30" rx="6" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="104" y="118" width="72" height="30" rx="6" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="64" y="82" width="72" height="30" rx="6" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="84" y="42" width="72" height="30" rx="6" fill={ACCENT} transform="rotate(-6 120 57)" />
    </g>
  ),
};

const CHAPTERS: Record<string, { track: Track; num: string; title: string }> = {
  typing: { track: 'foundation', num: '01', title: 'Печать и клавиатура' },
  'it-english': { track: 'foundation', num: '02', title: 'IT-английский: стартовый словарь' },
  'english-practice': { track: 'foundation', num: '03', title: 'Английский на практике' },
  'linux-terminal': { track: 'foundation', num: '04', title: 'Linux и терминал' },
  'files-packages-ssh': { track: 'foundation', num: '05', title: 'Файлы, пакеты, SSH' },
  'git-first-commit': { track: 'foundation', num: '06', title: 'Git: первый коммит' },
  'git-branches': { track: 'foundation', num: '07', title: 'Git: ветки и merge' },
  'git-remote': { track: 'foundation', num: '08', title: 'Git: push, PR и командная работа' },
  'android-studio': { track: 'foundation', num: '09', title: 'Android Studio: знакомство с IDE' },
  'kotlin-vars': { track: 'mobile', num: '01', title: 'Переменные и типы' },
  'functions-lambdas': { track: 'mobile', num: '02', title: 'Функции и лямбды' },
  'classes-collections': { track: 'mobile', num: '03', title: 'Классы и коллекции' },
  'first-compose-screen': { track: 'mobile', num: '04', title: 'Первый экран Compose' },
  'state-events': { track: 'mobile', num: '05', title: 'Состояние и события' },
  'layout-by-mockup': { track: 'mobile', num: '06', title: 'Вёрстка по макету' },
  'ui-kit': { track: 'mobile', num: '07', title: 'Многомодульность и UI Kit' },
  'what-is-blockchain': { track: 'blockchain', num: '01', title: 'Что такое блокчейн' },
  'waves-first-network': { track: 'blockchain', num: '02', title: 'Первая сеть на Waves Enterprise' },
};

export const CHAPTER_IDS = Object.keys(CHAPTERS);

const TRACK_ART: Record<Track, string> = {
  foundation: 'track-foundation',
  mobile: 'first-compose-screen',
  blockchain: 'what-is-blockchain',
};

function Frame({
  id, label, num, title, big, art, aria,
}: {
  id: string;
  label: string;
  num?: string;
  title: string;
  big?: boolean;
  art: React.ReactNode;
  aria: string;
}) {
  return (
    <svg viewBox="0 0 800 240" role="img" aria-label={aria} style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--ifm-color-primary-dark)" />
          <stop offset="1" stopColor="var(--ifm-color-primary-darkest)" />
        </linearGradient>
      </defs>
      <rect width="800" height="240" fill={`url(#${id})`} />
      <circle cx="655" cy="30" r="170" fill="rgba(255,255,255,0.05)" />
      <rect x="-40" y="185" width="900" height="120" fill="rgba(0,0,0,0.18)" transform="rotate(-4 400 230)" />
      {num && (
        <text x="30" y="168" fontSize="104" fontWeight={800} fill="rgba(255,255,255,0.09)">{num}</text>
      )}
      <text x="36" y="52" fontSize="14" letterSpacing="3" fontWeight={600} fill="rgba(255,255,255,0.6)">
        {label.toUpperCase()}
      </text>
      <text
        x="36" y="204" fontSize={big ? 44 : 28} fontWeight={700} fill="#fff"
        style={{ fontFamily: 'var(--ifm-heading-font-family, var(--ifm-font-family-base))' }}
      >
        {title}
      </text>
      <g transform="translate(545 20)">{art}</g>
    </svg>
  );
}

export default function ChapterCover({ chapterId }: { chapterId: string }) {
  const ch = CHAPTERS[chapterId];
  if (!ch) return null;
  return (
    <div className="chapter-cover">
      <Frame
        id={`ccg-${chapterId}`}
        label={`${TRACK_LABEL[ch.track]} · глава ${ch.num}`}
        num={ch.num}
        title={ch.title}
        art={ARTS[chapterId]()}
        aria={`Обложка главы «${ch.title}»`}
      />
    </div>
  );
}

export function TrackBanner({ track, mini }: { track: Track; mini?: boolean }) {
  return (
    <div className={mini ? 'track-banner track-banner--mini' : 'track-banner'}>
      <Frame
        id={`ccg-track-${track}${mini ? '-m' : ''}`}
        label="Трек"
        title={TRACK_LABEL[track]}
        big
        art={ARTS[TRACK_ART[track]]()}
        aria={`Трек «${TRACK_LABEL[track]}»`}
      />
    </div>
  );
}
