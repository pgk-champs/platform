import React from 'react';

type Track = 'foundation' | 'mobile' | 'blockchain' | 'advanced';

const TRACK_LABEL: Record<Track, string> = {
  foundation: 'Фундамент',
  mobile: 'Мобилка',
  blockchain: 'Блокчейн',
  advanced: 'Отдельные темы',
};

const ACCENT = 'var(--ifm-color-primary-lightest)';
const DARK = 'var(--ifm-color-primary-darkest)';
const INK = 'rgba(255,255,255,0.9)';
const SOFT = 'rgba(255,255,255,0.14)';
const MONO = 'var(--ifm-font-family-monospace)';

/* Каждая иллюстрация рисуется в поле 200x180 (правая часть обложки). */
const ARTS: Record<string, () => React.ReactNode> = {
  /* профиль-карточка с зелёной галочкой — «аккаунт создан» */
  'github-start': () => (
    <g strokeLinecap="round">
      <rect x="14" y="34" width="172" height="118" rx="14" fill={SOFT} stroke={INK} strokeWidth={3} />
      <circle cx="58" cy="80" r="20" fill="rgba(255,255,255,0.45)" />
      <path d="M32 130c4-18 13-26 26-26s22 8 26 26z" fill="rgba(255,255,255,0.45)" />
      <path d="M104 70h62M104 90h44" stroke="rgba(255,255,255,0.4)" strokeWidth={8} />
      <circle cx="150" cy="124" r="22" fill={ACCENT} />
      <path d="M140 124l7 8 14-16" stroke={DARK} strokeWidth={5} fill="none" strokeLinejoin="round" />
    </g>
  ),
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
  '02b-english-practice': () => (
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
  /* Свой узел: приватная сеть на geth */
  'geth-network': () => (
    <g strokeLinecap="round">
      <rect x="22" y="46" width="156" height="58" rx="12" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="70" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>datadir</text>
      <text x="100" y="88" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.45)" fontFamily={MONO}>chain · state · keys</text>

      <rect x="26" y="124" width="40" height="34" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="46" y="146" textAnchor="middle" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>0</text>
      <rect x="80" y="124" width="40" height="34" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="146" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>1</text>
      <rect x="134" y="124" width="40" height="34" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="154" y="146" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>2</text>

      <path d="M66 141h10M120 141h10" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M76 141l-5-4M76 141l-5 4M130 141l-5-4M130 141l-5 4" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M100 104v14" stroke={ACCENT} strokeWidth={3} fill="none" />

      <text x="100" y="180" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>:8545</text>
    </g>
  ),
  /* Hardhat: пакет, npx и структура проекта */
  'hh-start': () => (
    <g strokeLinecap="round">
      <rect x="20" y="44" width="76" height="36" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="58" y="67" textAnchor="middle" fontSize="7" fontWeight={800} fill={ACCENT} fontFamily={MONO}>package</text>

      <rect x="112" y="44" width="68" height="36" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="146" y="67" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>lock</text>

      <rect x="20" y="100" width="160" height="40" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="118" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>node_modules/.bin</text>
      <text x="100" y="133" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>hardhat</text>

      <path d="M58 80v18M146 80v18" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M58 98l-4-6M58 98l4-6M146 98l-4-6M146 98l4-6" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="52" y="154" width="96" height="30" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="174" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>npx hardhat</text>
      <path d="M100 140v12" stroke={ACCENT} strokeWidth={3} fill="none" />
    </g>
  ),
  /* hardhat.config.ts: настройки и сборка контрактов */
  'hh-config': () => (
    <g strokeLinecap="round">
      <rect x="22" y="46" width="72" height="108" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="58" y="70" textAnchor="middle" fontSize="6.5" fontWeight={800} fill={ACCENT} fontFamily={MONO}>config</text>
      <text x="58" y="92" textAnchor="middle" fontSize="6" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>plugins</text>
      <text x="58" y="110" textAnchor="middle" fontSize="6" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>solidity</text>
      <text x="58" y="128" textAnchor="middle" fontSize="6" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>networks</text>

      <path d="M94 100h26" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M120 100l-6-4M120 100l-6 4" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="124" y="46" width="56" height="30" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="152" y="66" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>abi</text>

      <rect x="124" y="86" width="56" height="30" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="152" y="106" textAnchor="middle" fontSize="6.5" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>bytecode</text>

      <rect x="124" y="126" width="56" height="30" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="152" y="146" textAnchor="middle" fontSize="6" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>build-info</text>

      <text x="100" y="180" textAnchor="middle" fontSize="7" fontWeight={800} fill={ACCENT} fontFamily={MONO}>2253 → 1115 байт</text>
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
  /* лестница коммитов: один переставлен наверх, на новую базу (арт «rebase-ladder») */
  'git-rebase': () => (
    <g strokeLinecap="round">
      <path d="M10 160H55V130H100V100H145V70H190" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx="32" cy="160" r="10" fill="none" stroke={INK} strokeWidth={4} />
      <circle cx="77" cy="130" r="10" fill="none" stroke={INK} strokeWidth={4} />
      <circle cx="122" cy="100" r="10" fill="none" stroke={INK} strokeWidth={4} />
      <circle cx="167" cy="70" r="13" fill={ACCENT} />
      <path d="M25 178C70 195 130 150 152 78" fill="none" stroke={ACCENT} strokeWidth={4} strokeDasharray="3 8" />
      <circle cx="25" cy="178" r="9" fill="none" stroke={ACCENT} strokeWidth={4} />
    </g>
  ),
  /* лупа над строкой лога — регулярка находит совпадения по шаблону (арт «regex-magnifier») */
  'grep-regex': () => (
    <g strokeLinecap="round">
      <rect x="10" y="70" width="176" height="40" rx="10" fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <path d="M24 90h18M78 90h18M150 90h20" stroke="rgba(255,255,255,0.4)" strokeWidth={7} />
      <rect x="46" y="78" width="28" height="24" rx="5" fill={ACCENT} />
      <text x="60" y="96" textAnchor="middle" fontSize="13" fontWeight={800} fill={DARK} fontFamily={MONO}>404</text>
      <rect x="100" y="78" width="44" height="24" rx="5" fill={ACCENT} />
      <text x="122" y="96" textAnchor="middle" fontSize="13" fontWeight={800} fill={DARK} fontFamily={MONO}>error</text>
      <circle cx="122" cy="90" r="38" fill="rgba(0,0,0,0.15)" stroke={INK} strokeWidth={6} />
      <path d="M148 116l30 30" stroke={INK} strokeWidth={9} />
    </g>
  ),
  /* пара ключей: приватный остаётся у тебя (сплошной), публичный отдаётся серверу (контур) — арт «ssh-key-pair» */
  'ssh-keys-deep': () => (
    <g strokeLinecap="round">
      <circle cx="40" cy="50" r="19" fill={ACCENT} />
      <circle cx="40" cy="50" r="7" fill={DARK} />
      <path d="M54 64l44 44" stroke={ACCENT} strokeWidth={9} fill="none" />
      <path d="M77 87l-12 12M94 104l-12 12" stroke={ACCENT} strokeWidth={9} fill="none" />
      <text x="40" y="150" textAnchor="middle" fontSize="14" fontWeight={700} fill={ACCENT} fontFamily={MONO}>private</text>
      <circle cx="160" cy="50" r="19" fill="none" stroke={INK} strokeWidth={6} />
      <path d="M146 64l-44 44" stroke={INK} strokeWidth={6} fill="none" />
      <path d="M123 87l12 12M106 104l12 12" stroke={INK} strokeWidth={6} fill="none" />
      <text x="160" y="150" textAnchor="middle" fontSize="14" fontWeight={700} fill="#fff" fontFamily={MONO}>public</text>
    </g>
  ),
  /* корень репозитория: README подсвечен, рядом служебные файлы — арт «repo-root» */
  'repo-anatomy': () => (
    <g strokeLinecap="round">
      <rect x="16" y="28" width="168" height="130" rx="14" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="30" y="44" width="140" height="26" rx="7" fill={ACCENT} />
      <text x="42" y="63" fontSize="14" fontWeight={800} fill={DARK} fontFamily={MONO}>README.md</text>
      <path d="M34 88h96M34 108h76M34 128h108" stroke="rgba(255,255,255,0.45)" strokeWidth={9} />
      <circle cx="152" cy="128" r="19" fill={ACCENT} />
      <path d="M143 128l6 7 13-15" stroke={DARK} strokeWidth={4.5} fill="none" strokeLinejoin="round" />
    </g>
  ),
  /* конвейер шагов: два пройдены, третий — зелёная галочка — арт «ci-pipeline» */
  'github-actions': () => (
    <g strokeLinecap="round">
      <rect x="12" y="72" width="46" height="46" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M26 95h18" stroke="rgba(255,255,255,0.5)" strokeWidth={7} />
      <path d="M64 95h18" stroke={INK} strokeWidth={5} />
      <rect x="88" y="72" width="46" height="46" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M102 95h18" stroke="rgba(255,255,255,0.5)" strokeWidth={7} />
      <path d="M140 95h14" stroke={INK} strokeWidth={5} />
      <circle cx="166" cy="95" r="24" fill={ACCENT} />
      <path d="M155 95l7 9 16-18" stroke={DARK} strokeWidth={5} fill="none" strokeLinejoin="round" />
      <text x="100" y="150" textAnchor="middle" fontSize="14" fontWeight={700} fill="#fff" fontFamily={MONO}>on: push</text>
    </g>
  ),
  /* две реплики ревью над диффом и ярлык версии — арт «review-release» */
  'code-review-release': () => (
    <g strokeLinecap="round">
      <rect x="14" y="30" width="104" height="44" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M34 70l-6 18 22-14z" fill={SOFT} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M30 46h64M30 58h40" stroke="rgba(255,255,255,0.45)" strokeWidth={6} />
      <rect x="82" y="86" width="104" height="44" rx="12" fill={ACCENT} />
      <path d="M166 126l6 18-22-14z" fill={ACCENT} />
      <path d="M98 102h64M98 114h34" stroke={DARK} strokeWidth={6} opacity={0.75} />
      <rect x="14" y="126" width="56" height="30" rx="9" fill="none" stroke={INK} strokeWidth={3} />
      <text x="42" y="147" textAnchor="middle" fontSize="14" fontWeight={800} fill="#fff" fontFamily={MONO}>v1.2</text>
    </g>
  ),
  /* четыре навыка Фундамента сходятся в один финиш — арт «foundation-final» */
  'foundation-final': () => (
    <g strokeLinecap="round">
      {[38, 70, 102, 134].map((y, i) => (
        <g key={y}>
          <rect x="12" y={y - 14} width="58" height="28" rx="9" fill={SOFT} stroke={INK} strokeWidth={3} />
          <path d={`M74 ${y}C104 ${y} 104 86 128 86`} stroke="rgba(255,255,255,0.45)" strokeWidth={5} fill="none" />
          <text x="41" y={y + 5} textAnchor="middle" fontSize="11" fontWeight={700} fill="#fff" fontFamily={MONO}>
            {['EN', 'git', 'ssh', 'sys'][i]}
          </text>
        </g>
      ))}
      <circle cx="152" cy="86" r="30" fill={ACCENT} />
      <path d="M138 86l9 11 20-23" stroke={DARK} strokeWidth={5} fill="none" strokeLinejoin="round" />
    </g>
  ),
  /* окно редактора: дерево файлов слева, подсказка автодополнения — арт «code-editor» */
  'code-editor': () => (
    <g strokeLinecap="round">
      <rect x="12" y="30" width="176" height="128" rx="14" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M62 34v120" stroke={INK} strokeWidth={3} />
      <path d="M26 56h24M26 74h22M26 92h26M26 110h20" stroke="rgba(255,255,255,0.45)" strokeWidth={7} />
      <path d="M76 56h64M76 74h44M76 110h52" stroke="rgba(255,255,255,0.45)" strokeWidth={7} />
      <rect x="76" y="84" width="98" height="18" rx="6" fill={ACCENT} />
      <text x="84" y="98" fontSize="12" fontWeight={800} fill={DARK} fontFamily={MONO}>useState</text>
    </g>
  ),
  /* две подписи на одном байткоде: Java длиннее, Kotlin короче — арт «kotlin-vs-java» */
  'kotlin-vs-java': () => (
    <g strokeLinecap="round">
      <rect x="14" y="34" width="80" height="46" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="54" y="62" textAnchor="middle" fontSize="13" fontWeight={800} fill="#fff" fontFamily={MONO}>Java</text>
      <rect x="106" y="34" width="80" height="46" rx="12" fill={ACCENT} />
      <text x="146" y="62" textAnchor="middle" fontSize="13" fontWeight={800} fill={DARK} fontFamily={MONO}>Kotlin</text>
      <path d="M54 84v14h92V84" stroke="rgba(255,255,255,0.45)" strokeWidth={4} fill="none" />
      <path d="M100 98v12" stroke="rgba(255,255,255,0.45)" strokeWidth={4} />
      <rect x="34" y="114" width="132" height="34" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="100" y="136" textAnchor="middle" fontSize="12" fontWeight={800} fill="#fff" fontFamily={MONO}>JVM</text>
    </g>
  ),
  /* линейка типов: числа без дробей, адрес, флажок — арт «solidity-types» */
  'solidity-types': () => (
    <g strokeLinecap="round">
      <rect x="16" y="46" width="168" height="26" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="30" y="64" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>uint256</text>
      <text x="174" y="64" textAnchor="end" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>78 знаков</text>

      <rect x="16" y="80" width="168" height="26" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="30" y="98" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>address</text>
      <text x="174" y="98" textAnchor="end" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>20 байт</text>

      <rect x="16" y="114" width="168" height="26" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="30" y="132" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>1 ether</text>
      <text x="174" y="132" textAnchor="end" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>10¹⁸ wei</text>

      <text x="100" y="164" textAnchor="middle" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>дробей нет</text>
      <text x="100" y="182" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>только целые</text>
    </g>
  ),
  /* щит с проверкой: одна ветка проходит, две отбиты — арт «solidity-errors» */
  'solidity-errors': () => (
    <g strokeLinecap="round">
      <path d="M100 40l58 20v44c0 30-24 52-58 66-34-14-58-36-58-66V60z" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="92" textAnchor="middle" fontSize="11" fontWeight={800} fill={ACCENT} fontFamily={MONO}>require</text>

      <path d="M62 118h76" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      <path d="M74 134l10 10 20-22" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M112 128l16 16M128 128l-16 16" stroke="rgba(255,140,140,0.9)" strokeWidth={3} />

      <text x="100" y="184" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>откат целиком</text>
    </g>
  ),
  /* развилка из трёх веток и часы блока — арт «solidity-flow» */
  'solidity-flow': () => (
    <g strokeLinecap="round">
      <circle cx="40" cy="90" r="10" fill={ACCENT} />
      <path d="M50 90h30M80 90l24-28M80 90h24M80 90l24 28" stroke={INK} strokeWidth={3} fill="none" />

      <rect x="110" y="46" width="72" height="24" rx="7" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x="146" y="63" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>seed · 0</text>

      <rect x="110" y="78" width="72" height="24" rx="7" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x="146" y="95" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>priv · 0.00075</text>

      <rect x="110" y="110" width="72" height="24" rx="7" fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x="146" y="127" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>pub · 0.001</text>

      <text x="100" y="160" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>301-я секунда</text>
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>первая истинная</text>
    </g>
  ),
  /* воронка вызова: вход, обёртка-модификатор, тело — арт «solidity-functions» */
  'solidity-functions': () => (
    <g strokeLinecap="round">
      <rect x="20" y="52" width="160" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="72" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>public · view</text>

      <rect x="34" y="90" width="132" height="30" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="110" textAnchor="middle" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>modifier _;</text>

      <rect x="52" y="128" width="96" height="28" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="147" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>тело</text>

      <path d="M100 34v12M100 46l-5-5M100 46l5-5" stroke={ACCENT} strokeWidth={3} fill="none" />
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>кто и почём</text>
    </g>
  ),
  /* ячейки хранилища: две заняты, одна обнулена — арт «solidity-storage» */
  'solidity-storage': () => (
    <g strokeLinecap="round">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={24 + i * 54} y="48" width="46" height="46" rx="8"
            fill={i === 1 ? 'rgba(0,0,0,0.35)' : SOFT} stroke={i === 1 ? INK : ACCENT} strokeWidth={3}
            strokeDasharray={i === 1 ? '5 4' : undefined} />
          <text x={47 + i * 54} y="77" textAnchor="middle" fontSize="10" fontWeight={800}
            fill={i === 1 ? 'rgba(255,255,255,0.45)' : ACCENT} fontFamily={MONO}>{i === 1 ? '0' : (i === 0 ? '7' : '9')}</text>
        </g>
      ))}
      <text x="100" y="112" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>длина всё ещё 3</text>

      <rect x="24" y="124" width="152" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="144" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>emit → журнал</text>

      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>итоги и история</text>
    </g>
  ),
  /* один чертёж и два объекта с разными адресами — арт «sol-contracts-oop» */
  'sol-contracts-oop': () => (
    <g strokeLinecap="round">
      <rect x="66" y="40" width="68" height="34" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="62" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>.sol</text>

      <path d="M92 78L52 104M108 78l40 26" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="16" y="106" width="70" height="46" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="51" y="126" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>0x5FbD…</text>
      <text x="51" y="142" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>count 3</text>

      <rect x="114" y="106" width="70" height="46" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="149" y="126" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>0x8464…</text>
      <text x="149" y="142" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>count 0</text>

      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>объект, не файл</text>
    </g>
  ),
  /* база сверху, два наследника снизу, стрелка вниз — арт «sol-inheritance» */
  'sol-inheritance': () => (
    <g strokeLinecap="round">
      <rect x="60" y="40" width="80" height="32" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="61" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>ERC20</text>

      <path d="M100 76v18M84 94h32" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M84 94v14M116 94v14" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="34" y="110" width="100" height="0" rx="0" fill="none" />
      <rect x="30" y="110" width="70" height="42" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="65" y="130" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>decimals</text>
      <text x="65" y="145" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>18</text>

      <rect x="106" y="110" width="70" height="42" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="141" y="130" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>override</text>
      <text x="141" y="145" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>12</text>

      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>взять и дописать</text>
    </g>
  ),
  /* два контракта и договор-мост между ними — арт «sol-interfaces» */
  'sol-interfaces': () => (
    <g strokeLinecap="round">
      <rect x="16" y="70" width="60" height="52" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="46" y="101" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>Vault</text>

      <rect x="124" y="70" width="60" height="52" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="154" y="101" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>Token</text>

      <rect x="80" y="80" width="40" height="32" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} strokeDasharray="5 4" />
      <text x="100" y="101" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>I</text>

      <path d="M78 96h2M120 96h2" stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="140" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>approve → transferFrom</text>

      <text x="100" y="176" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>договор без тела</text>
    </g>
  ),
  /* блок-библиотека и решётка хеша — арт «sol-libraries» */
  'sol-libraries': () => (
    <g strokeLinecap="round">
      <rect x="20" y="52" width="72" height="60" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="56" y="78" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>library</text>
      <path d="M32 90h48M32 100h32" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />

      <path d="M100 82h16M116 82l-5-4M116 82l-5 4" stroke={INK} strokeWidth={3} fill="none" />

      <rect x="124" y="52" width="60" height="60" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      {[0, 1, 2, 3].map((r) => (
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}-${c}`} x={132 + c * 12} y={60 + r * 12} width="8" height="8" rx="2"
            fill={(r + c) % 3 === 0 ? ACCENT : 'rgba(255,255,255,0.3)'} />
        ))
      ))}

      <text x="100" y="136" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>keccak256 → 32 байта</text>
      <text x="100" y="172" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>общий код</text>
      <text x="100" y="188" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>и отпечаток</text>
    </g>
  ),
  /* замок и стрелка, возвращающаяся назад — арт «sol-patterns» */
  'sol-patterns': () => (
    <g strokeLinecap="round">
      <rect x="66" y="86" width="68" height="52" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <path d="M84 86V70a16 16 0 0 1 32 0v16" fill="none" stroke={ACCENT} strokeWidth={3} />
      <circle cx="100" cy="110" r="6" fill={ACCENT} />

      <path d="M40 128c-14 22 4 40 26 34" fill="none" stroke="rgba(255,140,140,0.9)" strokeWidth={3} />
      <path d="M66 162l-8-4M66 162l-6 6" stroke="rgba(255,140,140,0.9)" strokeWidth={3} fill="none" />
      <text x="34" y="112" fontSize="8" fontWeight={800} fill="rgba(255,170,170,0.95)" fontFamily={MONO}>call</text>

      <path d="M160 128c14 22-4 40-26 34" fill="none" stroke={INK} strokeWidth={3} />
      <text x="150" y="112" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>_;</text>

      <text x="100" y="184" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>порядок строк</text>
    </g>
  ),
  /* монета с шестью насечками — арт «erc20-scratch» */
  'erc20-scratch': () => (
    <g strokeLinecap="round">
      <circle cx="100" cy="98" r="46" fill={SOFT} stroke={ACCENT} strokeWidth={4} />
      <text x="100" y="106" textAnchor="middle" fontSize="20" fontWeight={800} fill={ACCENT} fontFamily={MONO}>20</text>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        return (
          <line key={i} x1={100 + Math.cos(a) * 52} y1={98 + Math.sin(a) * 52}
            x2={100 + Math.cos(a) * 60} y2={98 + Math.sin(a) * 60} stroke={ACCENT} strokeWidth={4} />
        );
      })}
      <text x="100" y="168" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>6 функций · 2 события</text>
      <text x="100" y="188" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>договор</text>
    </g>
  ),
  /* готовый блок с щитом: наследуешь — получаешь — арт «erc20-oz» */
  'erc20-oz': () => (
    <g strokeLinecap="round">
      <rect x="28" y="46" width="144" height="34" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="68" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>@openzeppelin</text>

      <path d="M100 84v14M100 98l-5-5M100 98l5-5" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="42" y="104" width="116" height="44" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="124" textAnchor="middle" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>is ERC20</text>
      <text x="100" y="140" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>_update</text>

      <text x="100" y="170" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>3670 байт против 3976</text>
      <text x="100" y="188" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>чужой код</text>
    </g>
  ),
  /* сосуд с растущим уровнем и долями — арт «erc4626» */
  'erc4626': () => (
    <g strokeLinecap="round">
      <path d="M52 44h96v92a48 48 0 0 1-96 0z" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <path d="M56 100h88v36a44 44 0 0 1-88 0z" fill={SOFT} stroke="none" />
      <path d="M56 100h88" stroke={ACCENT} strokeWidth={3} />

      {[0, 1, 2].map((i) => (
        <rect key={i} x={64 + i * 26} y={116} width="18" height="18" rx="4" fill={ACCENT} opacity={0.85 - i * 0.22} />
      ))}

      <path d="M158 96l14-12M172 84l-2 8M172 84l-8 2" stroke={ACCENT} strokeWidth={3} fill="none" />
      <text x="100" y="170" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>1.00 → 1.30 → 1.47</text>
      <text x="100" y="188" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>цена доли</text>
    </g>
  ),
  /* корпус с постоянным адресом и сменной вставкой — арт «proxy-upgrade» */
  'proxy-upgrade': () => (
    <g strokeLinecap="round">
      <rect x="24" y="56" width="152" height="76" rx="12" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="78" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>0xe7f1…0512</text>

      <rect x="42" y="88" width="52" height="32" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} strokeDasharray="5 4" />
      <text x="68" y="109" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>V1</text>

      <path d="M102 104h14M116 104l-5-4M116 104l-5 4" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="122" y="88" width="40" height="32" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="142" y="109" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>V2</text>

      <text x="100" y="152" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>данные остались</text>
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>адрес тот же</text>
    </g>
  ),
  /* файл и три стрелки-пути к запуску — арт «ts-run» */
  'ts-run': () => (
    <g strokeLinecap="round">
      <rect x="18" y="76" width="54" height="44" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="45" y="103" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>.ts</text>

      <path d="M78 88h34" stroke={ACCENT} strokeWidth={3} />
      <path d="M112 88l-6-4M112 88l-6 4" stroke={ACCENT} strokeWidth={3} fill="none" />
      <rect x="118" y="72" width="52" height="32" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="144" y="93" textAnchor="middle" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>.js</text>

      <path d="M78 112h60" stroke="rgba(255,255,255,0.4)" strokeWidth={3} strokeDasharray="5 4" />
      <path d="M138 112l-6-4M138 112l-6 4" stroke="rgba(255,255,255,0.4)" strokeWidth={3} fill="none" />
      <text x="150" y="128" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>node .ts</text>

      <text x="100" y="158" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>601 байт или ничего</text>
      <text x="100" y="182" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>три пути</text>
    </g>
  ),
  /* две пустые коробки и перечёркнутая точка — арт «ts-null» */
  'ts-null': () => (
    <g strokeLinecap="round">
      <rect x="20" y="62" width="76" height="48" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} strokeDasharray="6 5" />
      <text x="58" y="92" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>undefined</text>

      <rect x="104" y="62" width="76" height="48" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="142" y="92" textAnchor="middle" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>null</text>

      <text x="58" y="128" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>возникло само</text>
      <text x="142" y="128" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>положили</text>

      <circle cx="100" cy="150" r="12" fill="none" stroke="rgba(255,140,140,0.9)" strokeWidth={3} />
      <path d="M92 142l16 16" stroke="rgba(255,140,140,0.9)" strokeWidth={3} />
      <text x="100" y="184" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>значения нет</text>
    </g>
  ),
  /* две формы и развилка объединения — арт «ts-types» */
  'ts-types': () => (
    <g strokeLinecap="round">
      <rect x="66" y="42" width="68" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="62" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>Result</text>

      <path d="M100 76v10M84 86h32M84 86v12M116 86v12" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="20" y="100" width="72" height="40" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="56" y="118" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>ok: true</text>
      <text x="56" y="132" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>data</text>

      <rect x="108" y="100" width="72" height="40" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="144" y="118" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>ok: false</text>
      <text x="144" y="132" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>error</text>

      <text x="100" y="164" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>метка различает варианты</text>
      <text x="100" y="186" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>форма данных</text>
    </g>
  ),
  /* восклицательный знак в круге и лестница стека — арт «ts-errors» */
  'ts-errors': () => (
    <g strokeLinecap="round">
      <circle cx="62" cy="88" r="30" fill={SOFT} stroke={ACCENT} strokeWidth={4} />
      <path d="M62 72v20" stroke={ACCENT} strokeWidth={5} />
      <circle cx="62" cy="102" r="3.5" fill={ACCENT} />

      {[0, 1, 2].map((i) => (
        <rect key={i} x={108 + i * 6} y={68 + i * 20} width={72 - i * 6} height="14" rx="4"
          fill="rgba(255,255,255,0.28)" />
      ))}
      <text x="144" y="132" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>стек вызовов</text>

      <text x="100" y="160" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>код выхода 1</text>
      <text x="100" y="184" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>отката нет</text>
    </g>
  ),
  /* клиент и узел, стрелки запроса и ответа — арт «ts-async-net» */
  'ts-async-net': () => (
    <g strokeLinecap="round">
      <rect x="14" y="70" width="56" height="48" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="42" y="99" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>скрипт</text>

      <path d="M76 84h48M124 84l-6-4M124 84l-6 4" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M124 104H76M76 104l6-4M76 104l6 4" stroke="rgba(255,255,255,0.45)" strokeWidth={3} fill="none" />
      <text x="100" y="72" textAnchor="middle" fontSize="7" fontWeight={800} fill={ACCENT} fontFamily={MONO}>POST</text>
      <text x="100" y="122" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>0x1263b4c</text>

      <rect x="130" y="70" width="56" height="48" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="158" y="99" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>узел</text>

      <text x="100" y="152" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>таймаут 500 мс</text>
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>обычный HTTP</text>
    </g>
  ),
  /* три файла со стрелками экспорта — арт «ts-modules» */
  'ts-modules': () => (
    <g strokeLinecap="round">
      <rect x="18" y="52" width="54" height="40" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="45" y="77" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>util</text>

      <rect x="128" y="52" width="54" height="40" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="155" y="77" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>types</text>

      <rect x="70" y="118" width="60" height="42" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="144" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>deploy</text>

      <path d="M55 96l32 18M145 96l-32 18" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M87 114l-9-1M87 114l-3-8M113 114l9-1M113 114l3-8" stroke={ACCENT} strokeWidth={3} fill="none" />

      <text x="100" y="106" textAnchor="middle" fontSize="7" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>import</text>
      <text x="100" y="184" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>по файлам</text>
    </g>
  ),
  /* типы TypeScript снимаются при компиляции, остаётся тот же JS — арт «ts-vs-js» */
  'ts-vs-js': () => (
    <g strokeLinecap="round">
      <rect x="12" y="52" width="70" height="64" rx="12" fill={ACCENT} />
      <text x="47" y="80" textAnchor="middle" fontSize="14" fontWeight={800} fill={DARK} fontFamily={MONO}>TS</text>
      <text x="47" y="100" textAnchor="middle" fontSize="10" fontWeight={700} fill={DARK} fontFamily={MONO}>: string</text>
      <path d="M92 84h30" stroke="rgba(255,255,255,0.5)" strokeWidth={5} />
      <path d="M116 76l10 8-10 8" fill="rgba(255,255,255,0.5)" />
      <rect x="132" y="52" width="56" height="64" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="160" y="90" textAnchor="middle" fontSize="14" fontWeight={800} fill="#fff" fontFamily={MONO}>JS</text>
    </g>
  ),
  /* два ярлыка, привязанных к одному значению — арт «ts-values» */
  'ts-values': () => (
    <g strokeLinecap="round">
      <circle cx="146" cy="88" r="34" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="146" y="94" textAnchor="middle" fontSize="13" fontWeight={800} fill="#fff" fontFamily={MONO}>42</text>
      <rect x="14" y="46" width="66" height="28" rx="9" fill={ACCENT} />
      <text x="47" y="65" textAnchor="middle" fontSize="11" fontWeight={800} fill={DARK} fontFamily={MONO}>sum</text>
      <rect x="14" y="102" width="66" height="28" rx="9" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="47" y="121" textAnchor="middle" fontSize="11" fontWeight={800} fill="#fff" fontFamily={MONO}>last</text>
      <path d="M84 60l26 14" stroke={ACCENT} strokeWidth={4} />
      <path d="M84 116l26-14" stroke="rgba(255,255,255,0.45)" strokeWidth={4} />
    </g>
  ),
  /* ромб-условие и две расходящиеся ветки — арт «ts-flow» */
  'ts-flow': () => (
    <g strokeLinecap="round">
      <path d="M62 46L104 74L62 102L20 74Z" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="62" y="79" textAnchor="middle" fontSize="12" fontWeight={800} fill="#fff" fontFamily={MONO}>if</text>
      <path d="M104 66h24" stroke={ACCENT} strokeWidth={4} />
      <rect x="128" y="34" width="58" height="30" rx="9" fill={ACCENT} />
      <path d="M128 66V49" stroke={ACCENT} strokeWidth={4} />
      <path d="M104 82h24v22" stroke="rgba(255,255,255,0.45)" strokeWidth={4} fill="none" />
      <rect x="128" y="104" width="58" height="30" rx="9" fill={SOFT} stroke={INK} strokeWidth={3} />
      <path d="M62 102v34h-34" stroke="rgba(255,255,255,0.3)" strokeWidth={4} fill="none" strokeDasharray="6 6" />
    </g>
  ),
  /* аргументы внутрь, одно значение обратно — арт «ts-functions» */
  'ts-functions': () => (
    <g strokeLinecap="round">
      <rect x="62" y="48" width="76" height="76" rx="14" fill={ACCENT} />
      <text x="100" y="93" textAnchor="middle" fontSize="13" fontWeight={800} fill={DARK} fontFamily={MONO}>fn()</text>
      <path d="M14 66h38" stroke="rgba(255,255,255,0.55)" strokeWidth={5} />
      <path d="M46 58l10 8-10 8" fill="rgba(255,255,255,0.55)" />
      <path d="M14 100h38" stroke="rgba(255,255,255,0.55)" strokeWidth={5} />
      <path d="M46 92l10 8-10 8" fill="rgba(255,255,255,0.55)" />
      <path d="M148 86h34" stroke={INK} strokeWidth={5} />
      <path d="M176 78l10 8-10 8" fill={INK} />
    </g>
  ),
  /* три ячейки массива и пары объекта — арт «ts-collections» */
  'ts-collections': () => (
    <g strokeLinecap="round">
      {[14, 74, 134].map((x, i) => (
        <g key={x}>
          <rect x={x} y="40" width="52" height="40" rx="10" fill={i === 1 ? ACCENT : SOFT} stroke={i === 1 ? 'none' : INK} strokeWidth={3} />
          <text x={x + 26} y="66" textAnchor="middle" fontSize="12" fontWeight={800} fill={i === 1 ? DARK : '#fff'} fontFamily={MONO}>{i}</text>
        </g>
      ))}
      <rect x="14" y="96" width="172" height="46" rx="12" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="44" y="124" textAnchor="middle" fontSize="11" fontWeight={800} fill="#fff" fontFamily={MONO}>key</text>
      <path d="M74 119h22" stroke={ACCENT} strokeWidth={4} />
      <text x="140" y="124" textAnchor="middle" fontSize="11" fontWeight={800} fill={ACCENT} fontFamily={MONO}>value</text>
    </g>
  ),
  /* родитель и наследник, договор пунктиром — арт «ts-inheritance» */
  'ts-inheritance': () => (
    <g strokeLinecap="round">
      <rect x="62" y="44" width="76" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="64" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>Tx</text>

      <path d="M100 78v16M100 94l-5-5M100 94l5-5" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="40" y="98" width="120" height="30" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="118" textAnchor="middle" fontSize="9" fontWeight={800} fill={ACCENT} fontFamily={MONO}>extends Tx</text>

      <rect x="40" y="136" width="120" height="26" rx="8" fill="none" stroke={ACCENT} strokeWidth={3} strokeDasharray="6 5" />
      <text x="100" y="154" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>implements Signer</text>

      <text x="100" y="184" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>по форме, не по имени</text>
    </g>
  ),
  /* чертёж и три изделия по нему — арт «ts-oop» */
  'ts-oop': () => (
    <g strokeLinecap="round">
      <rect x="14" y="38" width="66" height="104" rx="12" fill={ACCENT} />
      <text x="47" y="84" textAnchor="middle" fontSize="12" fontWeight={800} fill={DARK} fontFamily={MONO}>class</text>
      <path d="M32 100h30M32 114h20" stroke={DARK} strokeWidth={4} />
      <path d="M88 90h20" stroke={INK} strokeWidth={5} />
      <path d="M102 82l10 8-10 8" fill={INK} />
      {[38, 82, 126].map((y) => (
        <rect key={y} x="120" y={y} width="66" height="34" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      ))}
      <path d="M153 72v10M153 116v10" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="5 5" />
    </g>
  ),
  /* очередь задач втягивается в петлю цикла событий — арт «ts-async» */
  'ts-async': () => (
    <g strokeLinecap="round">
      {[46, 78, 110].map((y, i) => (
        <rect key={y} x="14" y={y} width={56 - i * 10} height="22" rx="7" fill={i === 0 ? ACCENT : SOFT} stroke={i === 0 ? 'none' : INK} strokeWidth={3} />
      ))}
      <path d="M76 57h16M76 89h16M76 121h16" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
      <circle cx="140" cy="89" r="40" fill="none" stroke={ACCENT} strokeWidth={4} strokeDasharray="14 9" />
      <path d="M134 42l16 7-16 7z" fill={ACCENT} />
      <text x="140" y="95" textAnchor="middle" fontSize="13" fontWeight={800} fill={ACCENT} fontFamily={MONO}>await</text>
      <text x="100" y="154" textAnchor="middle" fontSize="12" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>event loop</text>
    </g>
  ),
  /* лента лет с двумя отметками — арт «ts-history» */
  'ts-history': () => (
    <g strokeLinecap="round">
      <path d="M14 90h172" stroke={INK} strokeWidth={4} />
      {[
        { x: 34, h: 30, hot: false },
        { x: 78, h: 46, hot: false },
        { x: 122, h: 62, hot: true },
        { x: 166, h: 38, hot: false },
      ].map((p) => (
        <g key={p.x}>
          <rect x={p.x - 11} y={90 - p.h} width="22" height={p.h} rx="6" fill={p.hot ? ACCENT : SOFT} stroke={p.hot ? 'none' : INK} strokeWidth={3} />
          <circle cx={p.x} cy="90" r="5" fill={p.hot ? ACCENT : INK} />
        </g>
      ))}
      <text x="122" y="124" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>2015</text>
    </g>
  ),
  /* один вход, веер из трёх веток — арт «kotlin-flow» */
  'kotlin-flow': () => (
    <g strokeLinecap="round">
      <rect x="14" y="70" width="72" height="40" rx="12" fill={ACCENT} />
      <text x="50" y="95" textAnchor="middle" fontSize="13" fontWeight={800} fill={DARK} fontFamily={MONO}>when</text>
      {[44, 90, 136].map((y) => (
        <g key={y}>
          <path d={`M92 90H112V${y + 15}h14`} stroke={y === 90 ? ACCENT : 'rgba(255,255,255,0.4)'} strokeWidth={4} fill="none" />
          <rect x="126" y={y} width="60" height="30" rx="9" fill={y === 90 ? ACCENT : SOFT} stroke={y === 90 ? 'none' : INK} strokeWidth={3} />
        </g>
      ))}
      <path d="M50 128v18h96" stroke="rgba(255,255,255,0.25)" strokeWidth={4} fill="none" strokeDasharray="6 6" />
    </g>
  ),
  /* запечатанная иерархия: родитель и два наследника — арт «kotlin-oop» */
  'kotlin-oop': () => (
    <g strokeLinecap="round">
      <rect x="58" y="30" width="84" height="38" rx="12" fill={ACCENT} />
      <text x="100" y="55" textAnchor="middle" fontSize="12" fontWeight={800} fill={DARK} fontFamily={MONO}>sealed</text>
      <path d="M100 68v20M40 88h120M40 88v18M160 88v18" stroke={INK} strokeWidth={4} fill="none" />
      <rect x="10" y="106" width="60" height="34" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="130" y="106" width="60" height="34" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="82" y="112" width="36" height="24" rx="7" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="5 5" />
      <text x="100" y="130" textAnchor="middle" fontSize="11" fontWeight={800} fill="rgba(255,255,255,0.5)" fontFamily={MONO}>?</text>
    </g>
  ),
  /* три эпохи одной платформы, третья — горящая — арт «kotlin-history» */
  'kotlin-history': () => (
    <g strokeLinecap="round">
      {[
        { x: 14, label: 'Java' },
        { x: 76, label: 'Andr' },
        { x: 138, label: 'Kt' },
      ].map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y={i === 2 ? 40 : 66} width="48" height={i === 2 ? 74 : 48} rx="10" fill={i === 2 ? ACCENT : SOFT} stroke={i === 2 ? 'none' : INK} strokeWidth={3} />
          <text x={c.x + 24} y={i === 2 ? 84 : 96} textAnchor="middle" fontSize="11" fontWeight={800} fill={i === 2 ? DARK : '#fff'} fontFamily={MONO}>{c.label}</text>
        </g>
      ))}
      <path d="M14 130h172" stroke={INK} strokeWidth={4} />
      <path d="M62 90h14M124 90h14" stroke="rgba(255,255,255,0.45)" strokeWidth={4} />
      <text x="162" y="150" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>2017</text>
    </g>
  ),
  /* две дорожки времени: сплошная занятая и прерывистая свободная — арт «kotlin-coroutines» */
  /* поток значений во времени против одного хранимого — арт «flow-streams» */
  /* видимое окно поверх длинной ленты — арт «lazy-lists» */
  /* светлая и тёмная половины одной палитры — арт «material-theme» */
  /* рамка экрана: шапка, содержимое, нижняя панель — арт «scaffold-bars» */
  /* экран пересоздаётся, состояние остаётся — арт «viewmodel-state» */
  /* три слоя и стрелки внутрь — арт «app-layers» */
  /* запрос уходит, ответ приходит — арт «network-retrofit» */
  /* оборванная связь и запасной путь — арт «network-errors» */
  /* диск помнит, память забывает — арт «data-storage» */
  /* половина оценки срезана — арт «clean-code» */
  /* база в середине: сеть пишет, экран читает — арт «cache-offline» */
  /* текст превращается в байты: слева строки, справа блоки кода — арт «solidity-hello» */
  'solidity-hello': () => (
    <g strokeLinecap="round">
      <rect x="16" y="44" width="76" height="92" rx="10" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      {[58, 72, 86, 100, 114].map((y, i) => (
        <rect key={y} x="26" y={y} width={i % 2 === 0 ? 56 : 40} height="6" rx="3" fill="rgba(255,255,255,0.55)" />
      ))}

      <path d="M100 90h20M120 90l-6-5M120 90l-6 5" stroke={ACCENT} strokeWidth={3} fill="none" />

      <rect x="128" y="44" width="56" height="92" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      {[[136, 56], [152, 56], [168, 56], [136, 72], [152, 72], [168, 72], [136, 88], [152, 88], [168, 88], [136, 104], [152, 104], [168, 104]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="10" height="10" rx="2" fill={i % 3 === 0 ? ACCENT : 'rgba(255,255,255,0.35)'} />
      ))}
      <text x="156" y="130" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>0x37…</text>

      <text x="100" y="160" textAnchor="middle" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>364 байта</text>
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>текст → байты</text>
    </g>
  ),
  /* три кейса зелёные, четырнадцать — красные — арт «testing-mobile» */
  'testing-mobile': () => (
    <g strokeLinecap="round">
      <text x="30" y="52" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>руками · 3</text>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={30 + i * 18} cy={66} r="6" fill={ACCENT} />
      ))}

      <text x="30" y="96" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.6)" fontFamily={MONO}>тестом · 14</text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={30 + i * 18} cy={110} r="6" fill={i < 3 ? ACCENT : 'none'} stroke={i < 3 ? ACCENT : INK} strokeWidth={2} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={30 + i * 18} cy={128} r="6" fill={i < 3 ? ACCENT : 'none'} stroke={i < 3 ? ACCENT : INK} strokeWidth={2} />
      ))}
      <path d="M92 104l8 8M100 104l-8 8M110 122l8 8M118 122l-8 8M146 104l8 8M154 104l-8 8M128 122l8 8M136 122l-8 8" stroke={INK} strokeWidth={2} />

      <rect x="60" y="146" width="80" height="16" rx="5" fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x="100" y="157" textAnchor="middle" fontSize="8" fontWeight={800} fill={ACCENT} fontFamily={MONO}>RED → GREEN</text>
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>21% глазами</text>
    </g>
  ),
  /* три разрешения: два зелёных, одно перечёркнуто — арт «device-features» */
  'device-features': () => (
    <g strokeLinecap="round">
      <rect x="20" y="40" width="160" height="92" rx="14" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="100" y="62" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>Разрешить доступ к камере?</text>

      <rect x="34" y="76" width="60" height="22" rx="7" fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x="64" y="91" textAnchor="middle" fontSize="8" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>Нет</text>
      <rect x="106" y="76" width="60" height="22" rx="7" fill={ACCENT} stroke={ACCENT} strokeWidth={2} />
      <text x="136" y="91" textAnchor="middle" fontSize="8" fontWeight={800} fill={DARK} fontFamily={MONO}>Разрешить</text>

      <circle cx="46" cy="116" r="5" fill={ACCENT} />
      <circle cx="64" cy="116" r="5" fill={ACCENT} />
      <circle cx="82" cy="116" r="5" fill="none" stroke={INK} strokeWidth={2} />
      <path d="M78 112l8 8M86 112l-8 8" stroke={INK} strokeWidth={2} />

      <rect x="60" y="146" width="80" height="14" rx="5" fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x="100" y="156" textAnchor="middle" fontSize="7" fontWeight={800} fill={ACCENT} fontFamily={MONO}>виджет · 12</text>
      <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>владелец решает</text>
    </g>
  ),
  /* замок открыт токеном, не паролем — арт «auth-session» */
  'auth-session': () => (
    <g strokeLinecap="round">
      <rect x="14" y="44" width="172" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="26" y="64" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>ivan@mail.ru</text>

      <rect x="14" y="82" width="172" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="26" y="102" fontSize="12" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>••••••••</text>

      <rect x="60" y="122" width="80" height="34" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="100" y="145" textAnchor="middle" fontSize="10" fontWeight={800} fill={ACCENT} fontFamily={MONO}>Bearer</text>

      <text x="100" y="176" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>токен, не пароль</text>
    </g>
  ),
  'cache-offline': () => (
    <g strokeLinecap="round">
      <rect x="14" y="52" width="50" height="40" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="39" y="77" textAnchor="middle" fontSize="9" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>сеть</text>

      <path d="M70 72h16M86 72l-5-4M86 72l-5 4" stroke={INK} strokeWidth={2.5} fill="none" />

      <rect x="92" y="44" width="56" height="56" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      {[58, 70, 82].map((y) => (
        <rect key={y} x="102" y={y} width="36" height="7" rx="3" fill={ACCENT} />
      ))}

      <path d="M154 72h16M170 72l-5-4M170 72l-5 4" stroke={ACCENT} strokeWidth={2.5} fill="none" />
      <rect x="176" y="52" width="10" height="40" rx="4" fill="rgba(255,255,255,0.2)" />

      <rect x="14" y="112" width="172" height="26" rx="8" fill="rgba(0,0,0,0.25)" stroke={SOFT} strokeWidth={2} />
      <text x="100" y="130" textAnchor="middle" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.8)" fontFamily={MONO}>данные от 12:40</text>

      <text x="100" y="166" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>работает без сети</text>
    </g>
  ),
  'clean-code': () => (
    <g strokeLinecap="round">
      <rect x="14" y="40" width="172" height="46" rx="10" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="26" y="60" fontSize="10" fontWeight={800} fill={ACCENT} fontFamily={MONO}>/** ... */</text>
      <text x="26" y="78" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily={MONO}>05-09-2026</text>

      <rect x="14" y="96" width="172" height="26" rx="8" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x="26" y="114" fontSize="9.5" fontWeight={800} fill="rgba(255,255,255,0.8)" fontFamily={MONO}>[Tag]: Событие</text>

      <rect x="14" y="132" width="103" height="20" rx="6" fill={ACCENT} />
      <rect x="121" y="132" width="65" height="20" rx="6" fill="rgba(255,255,255,0.12)" />
      <text x="100" y="174" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>×0,5 без них</text>
    </g>
  ),
  'data-storage': () => (
    <g strokeLinecap="round">
      <rect x="14" y="44" width="76" height="104" rx="11" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} strokeDasharray="7 5" />
      <text x="52" y="90" textAnchor="middle" fontSize="11" fontWeight={800} fill="rgba(255,255,255,0.4)" fontFamily={MONO}>память</text>
      <text x="52" y="116" textAnchor="middle" fontSize="16" fontWeight={800} fill="rgba(255,255,255,0.3)" fontFamily={MONO}>—</text>

      <rect x="110" y="44" width="76" height="104" rx="11" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="148" y="78" textAnchor="middle" fontSize="11" fontWeight={800} fill={ACCENT} fontFamily={MONO}>диск</text>
      {[92, 108, 124].map((y) => (
        <rect key={y} x="122" y={y} width="52" height="8" rx="3" fill={ACCENT} />
      ))}

      <text x="100" y="172" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>после перезапуска</text>
    </g>
  ),
  'network-errors': () => (
    <g strokeLinecap="round">
      <rect x="14" y="52" width="56" height="96" rx="11" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <rect x="130" y="52" width="56" height="96" rx="11" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />

      <path d="M78 84h14M108 84h14" stroke={INK} strokeWidth={3} fill="none" />
      <path d="M95 74l10 20M105 74l-10 20" stroke="rgba(255,140,140,0.95)" strokeWidth={3} fill="none" />

      <rect x="78" y="112" width="44" height="24" rx="8" fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <path d="M88 124h24M112 124l-5-4M112 124l-5 4" stroke={ACCENT} strokeWidth={2.5} fill="none" />

      <text x="100" y="172" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>повторить</text>
    </g>
  ),
  'network-retrofit': () => (
    <g strokeLinecap="round">
      <rect x="14" y="46" width="64" height="108" rx="11" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="46" y="106" textAnchor="middle" fontSize="11" fontWeight={800} fill="rgba(255,255,255,0.8)" fontFamily={MONO}>app</text>

      <path d="M88 78h60M148 78l-7-6M148 78l-7 6" stroke={ACCENT} strokeWidth={3} fill="none" />
      <text x="118" y="68" textAnchor="middle" fontSize="10" fontWeight={800} fill={ACCENT} fontFamily={MONO}>GET</text>

      <path d="M148 122H88M88 122l7-6M88 122l7 6" stroke={INK} strokeWidth={3} fill="none" />
      <text x="118" y="142" textAnchor="middle" fontSize="10" fontWeight={800} fill="rgba(255,255,255,0.7)" fontFamily={MONO}>200</text>

      <rect x="156" y="46" width="30" height="108" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <circle cx="171" cy="72" r="4" fill={ACCENT} />
      <circle cx="171" cy="100" r="4" fill={ACCENT} />
      <circle cx="171" cy="128" r="4" fill={ACCENT} />

      <text x="100" y="176" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>настоящие данные</text>
    </g>
  ),
  'app-layers': () => (
    <g strokeLinecap="round">
      <rect x="14" y="44" width="172" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="26" y="64" fontSize="12" fontWeight={800} fill="rgba(255,255,255,0.85)" fontFamily={MONO}>ui</text>

      <rect x="14" y="84" width="172" height="30" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="26" y="104" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>domain</text>

      <rect x="14" y="124" width="172" height="30" rx="9" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} />
      <text x="26" y="144" fontSize="12" fontWeight={800} fill="rgba(255,255,255,0.85)" fontFamily={MONO}>data</text>

      <path d="M160 74v10M160 84l-4-4M160 84l4-4" stroke={ACCENT} strokeWidth={3} fill="none" />
      <path d="M160 124v-10M160 114l-4 4M160 114l4 4" stroke={ACCENT} strokeWidth={3} fill="none" />

      <text x="100" y="176" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>стрелки внутрь</text>
    </g>
  ),
  'viewmodel-state': () => (
    <g strokeLinecap="round">
      <rect x="14" y="40" width="76" height="96" rx="11" fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={3} strokeDasharray="7 5" />
      <text x="52" y="94" textAnchor="middle" fontSize="20" fontWeight={800} fill="rgba(255,255,255,0.35)" fontFamily={MONO}>0</text>

      <path d="M100 88h18M118 88l-6-6M118 88l-6 6" stroke={INK} strokeWidth={3} fill="none" />

      <rect x="126" y="40" width="60" height="96" rx="11" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="156" y="94" textAnchor="middle" fontSize="20" fontWeight={800} fill={ACCENT} fontFamily={MONO}>7</text>

      <text x="100" y="162" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>пережило поворот</text>
    </g>
  ),
  'scaffold-bars': () => (
    <g strokeLinecap="round">
      <rect x="14" y="34" width="172" height="124" rx="12" fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={3} />
      <rect x="24" y="44" width="152" height="24" rx="7" fill={ACCENT} />
      {[78, 96, 114].map((y) => (
        <rect key={y} x="24" y={y} width="152" height="12" rx="4" fill={SOFT} />
      ))}
      <rect x="24" y="132" width="152" height="18" rx="6" fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      {[34, 72, 110, 148].map((x) => (
        <circle key={x} cx={x + 8} cy="141" r="4" fill={x === 34 ? ACCENT : 'rgba(255,255,255,0.4)'} />
      ))}
      <text x="100" y="176" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>каркас</text>
    </g>
  ),
  'material-theme': () => (
    <g strokeLinecap="round">
      <rect x="14" y="40" width="84" height="112" rx="12" fill="rgba(255,255,255,0.92)" stroke={INK} strokeWidth={3} />
      <rect x="26" y="54" width="60" height="12" rx="5" fill="#1B1B1B" />
      <rect x="26" y="74" width="42" height="10" rx="4" fill="rgba(0,0,0,0.45)" />
      <rect x="26" y="112" width="60" height="26" rx="8" fill={DARK} />

      <rect x="102" y="40" width="84" height="112" rx="12" fill="rgba(0,0,0,0.55)" stroke={ACCENT} strokeWidth={3} />
      <rect x="114" y="54" width="60" height="12" rx="5" fill="rgba(255,255,255,0.9)" />
      <rect x="114" y="74" width="42" height="10" rx="4" fill="rgba(255,255,255,0.45)" />
      <rect x="114" y="112" width="60" height="26" rx="8" fill={ACCENT} />

      <text x="100" y="172" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>одна разметка</text>
    </g>
  ),
  'lazy-lists': () => (
    <g strokeLinecap="round">
      {[38, 58, 78, 98, 118, 138].map((y, i) => (
        <rect key={y} x="14" y={y} width="172" height="14" rx="5"
          fill={i >= 1 && i <= 3 ? ACCENT : SOFT} stroke={i >= 1 && i <= 3 ? ACCENT : INK} strokeWidth={2} />
      ))}
      <rect x="8" y="52" width="184" height="62" rx="10" fill="none" stroke={ACCENT} strokeWidth={3} strokeDasharray="7 5" />
      <text x="100" y="170" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>только видимое</text>
    </g>
  ),
  'flow-streams': () => (
    <g strokeLinecap="round">
      <text x="14" y="34" fontSize="11" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>Flow</text>
      {[14, 62, 110, 158].map((x, i) => (
        <rect key={x} x={x} y="44" width="34" height="26" rx="8" fill={i === 3 ? SOFT : ACCENT} stroke={ACCENT} strokeWidth={3} />
      ))}
      <path d="M52 57h6M100 57h6M148 57h6" stroke={INK} strokeWidth={3} />

      <text x="14" y="106" fontSize="11" fontWeight={800} fill={ACCENT} fontFamily={MONO}>StateFlow</text>
      <rect x="14" y="116" width="172" height="34" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
      <rect x="24" y="124" width="60" height="18" rx="6" fill={INK} />
      <text x="100" y="138" fontSize="11" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>.value</text>
    </g>
  ),
  'kotlin-coroutines': () => (
    <g strokeLinecap="round">
      <rect x="14" y="44" width="172" height="30" rx="9" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="24" y="64" fontSize="11" fontWeight={800} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>sleep</text>
      <rect x="72" y="50" width="108" height="18" rx="6" fill="rgba(255,255,255,0.22)" />

      <rect x="14" y="94" width="172" height="30" rx="9" fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x="24" y="114" fontSize="11" fontWeight={800} fill={ACCENT} fontFamily={MONO}>delay</text>
      {[72, 108, 144].map((x) => (
        <rect key={x} x={x} y="100" width="24" height="18" rx="6" fill={ACCENT} />
      ))}
      <path d="M100 109h4M136 109h4" stroke={DARK} strokeWidth={3} />
      <text x="100" y="150" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>1 поток</text>
    </g>
  ),
  /* полный слот, слот с дыркой и страж между ними — арт «kotlin-null» */
  'kotlin-null': () => (
    <g strokeLinecap="round">
      <rect x="14" y="42" width="118" height="32" rx="9" fill={ACCENT} />
      <text x="73" y="63" textAnchor="middle" fontSize="12" fontWeight={800} fill={DARK} fontFamily={MONO}>String</text>

      <rect x="14" y="92" width="118" height="32" rx="9" fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x="58" y="113" textAnchor="middle" fontSize="12" fontWeight={800} fill="#fff" fontFamily={MONO}>String?</text>
      <circle cx="110" cy="108" r="10" fill="none" stroke={ACCENT} strokeWidth={3} strokeDasharray="4 4" />

      <rect x="146" y="58" width="40" height="52" rx="12" fill="none" stroke={ACCENT} strokeWidth={3} />
      <text x="166" y="91" textAnchor="middle" fontSize="15" fontWeight={800} fill={ACCENT} fontFamily={MONO}>?.</text>
      <path d="M132 58h14M132 108h14" stroke={INK} strokeWidth={3} />
      <text x="100" y="150" textAnchor="middle" fontSize="12" fontWeight={800} fill={ACCENT} fontFamily={MONO}>?. ?: !!</text>
    </g>
  ),
};

const CHAPTERS: Record<string, { track: Track; num: string; title: string }> = {
  'github-start': { track: 'foundation', num: '00', title: 'GitHub с нуля' },
  typing: { track: 'foundation', num: '01', title: 'Печать и клавиатура' },
  'it-english': { track: 'foundation', num: '02', title: 'IT-английский: стартовый словарь' },
  '02b-english-practice': { track: 'foundation', num: '03', title: 'Английский на практике' },
  'linux-terminal': { track: 'foundation', num: '04', title: 'Linux и терминал' },
  'files-packages-ssh': { track: 'foundation', num: '05', title: 'Файлы, пакеты, SSH' },
  'git-first-commit': { track: 'foundation', num: '06', title: 'Git: первый коммит' },
  'git-branches': { track: 'foundation', num: '07', title: 'Git: ветки и merge' },
  'git-remote': { track: 'foundation', num: '08', title: 'Git: push, PR и командная работа' },
  'foundation-final': { track: 'foundation', num: '08', title: 'Финал Фундамента: английский, git, SSH, система, клавиатура' },
  'android-studio': { track: 'mobile', num: '00', title: 'Android Studio: знакомство с IDE' },
  'kotlin-vars': { track: 'mobile', num: '01', title: 'Переменные и типы' },
  'kotlin-flow': { track: 'mobile', num: '03', title: 'Условия и циклы на Kotlin' },
  'functions-lambdas': { track: 'mobile', num: '04', title: 'Функции и лямбды' },
  'classes-collections': { track: 'mobile', num: '05', title: 'Классы и коллекции' },
  'kotlin-oop': { track: 'mobile', num: '06', title: 'ООП на Kotlin: классы, наследование, интерфейсы' },
  'first-compose-screen': { track: 'mobile', num: '07', title: 'Первый экран Compose' },
  'state-events': { track: 'mobile', num: '08', title: 'Состояние и события' },
  'layout-by-mockup': { track: 'mobile', num: '09', title: 'Вёрстка по макету' },
  'ui-kit': { track: 'mobile', num: '10', title: 'Многомодульность и UI Kit' },
  'what-is-blockchain': { track: 'blockchain', num: '01', title: 'Что такое блокчейн' },
  'geth-network': { track: 'blockchain', num: '33', title: 'Свой узел: приватная сеть на geth' },
  'hh-start': { track: 'blockchain', num: '34', title: 'Hardhat: пакет, npx и структура проекта' },
  'hh-config': { track: 'blockchain', num: '35', title: 'hardhat.config.ts: настройки и сборка контрактов' },
  'waves-first-network': { track: 'blockchain', num: '38', title: 'Первая сеть на Waves Enterprise' },
  'code-editor': { track: 'blockchain', num: '02', title: 'Редактор кода: WebStorm и VS Code' },
  'kotlin-vs-java': { track: 'mobile', num: '26', title: 'Kotlin и Java: в чём разница' },
  'kotlin-history': { track: 'mobile', num: '27', title: 'История Java, Android и Kotlin' },
  'testing-mobile': { track: 'mobile', num: '25', title: 'Тестирование: MockWebServer, фейки и TDD' },
  'device-features': { track: 'mobile', num: '24', title: 'Возможности устройства: камера, уведомления, виджет' },
  'auth-session': { track: 'mobile', num: '23', title: 'Авторизация: вход, живая сессия и биометрия' },
  'cache-offline': { track: 'mobile', num: '21', title: 'Кэш и офлайн: база как источник истины' },
  'clean-code': { track: 'mobile', num: '22', title: 'Чистый код: комментарии и логирование, которые оценивают' },
  'data-storage': { track: 'mobile', num: '20', title: 'Хранение на устройстве: DataStore и Room' },
  'network-errors': { track: 'mobile', num: '19', title: 'Когда сети нет: ошибки, повторы и что видит пользователь' },
  'network-retrofit': { track: 'mobile', num: '18', title: 'Сеть: тот же экран, но с настоящими данными' },
  'app-layers': { track: 'mobile', num: '17', title: 'Слои приложения: data, domain и репозиторий' },
  'viewmodel-state': { track: 'mobile', num: '16', title: 'ViewModel: состояние, которое переживает поворот' },
  'scaffold-bars': { track: 'mobile', num: '13', title: 'Scaffold: каркас экрана, шапка и нижняя панель' },
  'material-theme': { track: 'mobile', num: '12', title: 'Material 3: тема, которую вам уже сгенерировали' },
  'lazy-lists': { track: 'mobile', num: '11', title: 'Списки: LazyColumn и всё, что не нарисовать циклом' },
  'flow-streams': { track: 'mobile', num: '15', title: 'Flow: поток значений во времени' },
  'kotlin-coroutines': { track: 'mobile', num: '14', title: 'Корутины: как приложение не зависает' },
  'kotlin-null': { track: 'mobile', num: '02', title: 'Null-безопасность: ошибка на миллиард долларов' },
  'solidity-hello': { track: 'blockchain', num: '03', title: 'Первый контракт: из чего состоит код' },
  'solidity-types': { track: 'blockchain', num: '04', title: 'Типы данных: uint, address, bool, string и деньги' },
  'solidity-errors': { track: 'blockchain', num: '05', title: 'Ошибки и проверки: require, revert, assert' },
  'solidity-flow': { track: 'blockchain', num: '06', title: 'Условия, циклы и время: как контракт принимает решения' },
  'solidity-functions': { track: 'blockchain', num: '07', title: 'Функции: видимость, view, payable и модификаторы' },
  'solidity-storage': { track: 'blockchain', num: '08', title: 'Хранение данных: mapping, struct, массивы и события' },
  'sol-contracts-oop': { track: 'blockchain', num: '09', title: 'Контракт как объект: конструктор, enum и роли' },
  'sol-inheritance': { track: 'blockchain', num: '10', title: 'Наследование: is, virtual, override и super' },
  'sol-interfaces': { track: 'blockchain', num: '11', title: 'Интерфейсы: договор между контрактами' },
  'sol-libraries': { track: 'blockchain', num: '12', title: 'Библиотеки, import и хеши: keccak256 и abi.encode' },
  'sol-patterns': { track: 'blockchain', num: '13', title: 'Паттерны безопасности: владелец, реентерабельность, выплаты' },
  'erc20-scratch': { track: 'blockchain', num: '14', title: 'ERC20 с нуля: как устроен токен' },
  'erc20-oz': { track: 'blockchain', num: '15', title: 'Готовый ERC20: OpenZeppelin и что он делает за вас' },
  'erc4626': { track: 'blockchain', num: '16', title: 'ERC4626: доли хранилища вместо баланса' },
  'proxy-upgrade': { track: 'blockchain', num: '17', title: 'Прокси: обновление логики без смены адреса' },
  'ts-run': { track: 'blockchain', num: '19', title: 'Как запустить код: Node, tsc и первая программа' },
  'ts-null': { track: 'blockchain', num: '21', title: 'Пусто: null, undefined и строгие проверки' },
  'ts-types': { track: 'blockchain', num: '25', title: 'Свои типы: интерфейсы, объединения и обобщения' },
  'ts-errors': { track: 'blockchain', num: '28', title: 'Ошибки: throw, try/catch и результат вместо исключения' },
  'ts-async-net': { track: 'blockchain', num: '30', title: 'Запросы к узлу: fetch, JSON-RPC и таймауты' },
  'ts-modules': { track: 'blockchain', num: '31', title: 'Модули и проект: import, export и структура папок' },
  'ts-vs-js': { track: 'blockchain', num: '18', title: 'TypeScript и JavaScript: в чём разница' },
  'ts-values': { track: 'blockchain', num: '20', title: 'Значения и переменные: числа, строки, типы' },
  'ts-flow': { track: 'blockchain', num: '22', title: 'Условия и циклы: как программа принимает решения' },
  'ts-functions': { track: 'blockchain', num: '23', title: 'Функции: как код перестаёт повторяться' },
  'ts-collections': { track: 'blockchain', num: '24', title: 'Массивы и объекты: как хранят много данных сразу' },
  'ts-inheritance': { track: 'blockchain', num: '27', title: 'Наследование и интерфейсы в TypeScript' },
  'ts-oop': { track: 'blockchain', num: '26', title: 'Классы на TypeScript: объекты, поля и инкапсуляция' },
  'ts-history': { track: 'blockchain', num: '32', title: 'История JavaScript и TypeScript' },
  'ts-async': { track: 'blockchain', num: '29', title: 'Асинхронность: промисы, async/await и цикл событий' },
  'grep-regex': { track: 'advanced', num: '01', title: 'Регулярные выражения для grep' },
  'ssh-keys-deep': { track: 'advanced', num: '02', title: 'SSH-ключи глубоко' },
  'git-rebase': { track: 'advanced', num: '03', title: 'Rebase мастерски' },
  'repo-anatomy': { track: 'advanced', num: '04', title: 'Анатомия взрослого репозитория' },
  'github-actions': { track: 'advanced', num: '05', title: 'CI: робот проверяет за тебя' },
  'code-review-release': { track: 'advanced', num: '06', title: 'Ревью, коммиты, релизы' },
};

export const CHAPTER_IDS = Object.keys(CHAPTERS);

const TRACK_ART: Record<Track, string> = {
  foundation: 'track-foundation',
  mobile: 'first-compose-screen',
  blockchain: 'what-is-blockchain',
  advanced: 'grep-regex',
};

/* Заголовок на обложке — одна строка без переноса, а места до правого края 744 px.
 * Самая широкая кириллическая буква даёт около 0.59 от кегля, поэтому длинные
 * названия уменьшаем ступеньками: иначе строка уезжает за viewBox и обрезается. */
export function coverFontSize(title: string): number {
  return title.length >= 56 ? 21 : title.length >= 48 ? 25 : 28;
}

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
        x="36" y="204" fontSize={big ? 44 : coverFontSize(title)} fontWeight={700} fill="#fff"
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
