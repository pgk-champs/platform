import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import './trainers.css';

/* Иллюстрация с подписью — стиль продолжает обложки ChapterCover:
 * тёмный градиент, белая «тушь», акцент primary-lightest. */

const ACCENT = 'var(--ifm-color-primary-lightest)';
const DARK = 'var(--ifm-color-primary-darkest)';
const INK = 'rgba(255,255,255,0.9)';
const SOFT = 'rgba(255,255,255,0.14)';
const FADE = 'rgba(255,255,255,0.45)';
const MONO = 'var(--ifm-font-family-monospace)';

function Panel({
  id, w, h, aria, children,
}: {
  id: string;
  w: number;
  h: number;
  aria: string;
  children: React.ReactNode;
}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={aria} style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--ifm-color-primary-dark)" />
          <stop offset="1" stopColor="var(--ifm-color-primary-darkest)" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} rx="16" fill={`url(#${id})`} />
      <circle cx={w - 130} cy={16} r={150} fill="rgba(255,255,255,0.05)" />
      {children}
    </svg>
  );
}

/* Стрелка вправо с наконечником */
function Arrow({ x1, y1, x2, y2, color = INK, w = 5 }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; w?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x2 - ux * 14;
  const hy = y2 - uy * 14;
  return (
    <g stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1} ${y1}L${hx} ${hy}`} />
      <path d={`M${x2} ${y2}L${hx - uy * 7} ${hy + ux * 7}M${x2} ${y2}L${hx + uy * 7} ${hy - ux * 7}`} />
    </g>
  );
}

function FileIcon({ x, y, accent }: { x: number; y: number; accent?: boolean }) {
  return (
    <g>
      <path
        d={`M${x} ${y + 8}a8 8 0 0 1 8-8h26l16 16v40a8 8 0 0 1-8 8h-34a8 8 0 0 1-8-8z`}
        fill={accent ? ACCENT : SOFT}
        stroke={accent ? 'none' : INK}
        strokeWidth={2.5}
      />
      <path d={`M${x + 10} ${y + 34}h30M${x + 10} ${y + 46}h20`} stroke={accent ? DARK : FADE} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

const SCHEMES: Record<string, (aria: string) => React.ReactNode> = {
  /* рабочая папка → индекс (staging) → история */
  'git-three-zones': (aria) => (
    <Panel id="fig-g-zones" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT · ТРИ ЗОНЫ</text>
      <rect x={30} y={70} width={190} height={130} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <FileIcon x={62} y={100} />
      <FileIcon x={130} y={100} accent />
      <rect x={305} y={70} width={190} height={130} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} strokeDasharray="10 7" />
      <FileIcon x={375} y={100} accent />
      <rect x={580} y={70} width={190} height={130} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <path d="M602 135h146" stroke={FADE} strokeWidth={5} strokeLinecap="round" />
      <circle cx={630} cy={135} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={675} cy={135} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={720} cy={135} r={13} fill={ACCENT} />
      <Arrow x1={228} y1={135} x2={297} y2={135} color={ACCENT} />
      <text x={262} y={116} textAnchor="middle" fontSize={15} fontWeight={700} fill={ACCENT} fontFamily={MONO}>git add</text>
      <Arrow x1={503} y1={135} x2={572} y2={135} color={ACCENT} />
      <text x={537} y={116} textAnchor="middle" fontSize={15} fontWeight={700} fill={ACCENT} fontFamily={MONO}>commit</text>
      <text x={125} y={238} textAnchor="middle" fontSize={18} fontWeight={600} fill="#fff">рабочая папка</text>
      <text x={400} y={238} textAnchor="middle" fontSize={18} fontWeight={600} fill="#fff">индекс (staging)</text>
      <text x={675} y={238} textAnchor="middle" fontSize={18} fontWeight={600} fill="#fff">история коммитов</text>
    </Panel>
  ),
  /* local ↔ origin */
  'git-local-remote': (aria) => (
    <Panel id="fig-g-remote" w={800} h={300} aria={aria}>
      {/* ноутбук слева внизу */}
      <g strokeLinecap="round">
        <rect x={80} y={110} width={190} height={115} rx={10} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={3} />
        <text x={100} y={155} fontSize={19} fontWeight={700} fill={ACCENT} fontFamily={MONO}>$ git push</text>
        <path d="M96 178h120M96 198h80" stroke={FADE} strokeWidth={6} />
        <path d="M60 225h230l-16 22H76z" fill={SOFT} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <text x={175} y={282} textAnchor="middle" fontSize={17} fontWeight={600} fill="#fff">твой компьютер · local</text>
      {/* облако-сервер справа вверху */}
      <g fill={ACCENT} opacity={0.92}>
        <rect x={520} y={72} width={190} height={50} rx={25} />
        <circle cx={580} cy={62} r={30} />
        <circle cx={636} cy={52} r={38} />
      </g>
      <text x={615} y={158} textAnchor="middle" fontSize={17} fontWeight={600} fill="#fff">сервер · origin (GitHub)</text>
      {/* стрелки push / pull */}
      <Arrow x1={300} y1={150} x2={498} y2={104} color={ACCENT} w={6} />
      <text x={392} y={104} textAnchor="middle" fontSize={17} fontWeight={700} fill={ACCENT} fontFamily={MONO}>git push</text>
      <Arrow x1={520} y1={180} x2={322} y2={226} color={INK} w={6} />
      <text x={440} y={230} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff" fontFamily={MONO}>git pull / fetch</text>
    </Panel>
  ),
  /* дерево ФС с домиком ~ */
  'linux-fs-tree': (aria) => (
    <Panel id="fig-g-fs" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>LINUX · ФАЙЛОВАЯ СИСТЕМА</text>
      {/* связи */}
      <g stroke={FADE} strokeWidth={3} fill="none">
        <path d="M400 96v20c0 14-170 6-170 26v14" />
        <path d="M400 96v60" />
        <path d="M400 96v20c0 14 150 6 150 26v14" />
        <path d="M230 196v40" />
      </g>
      {/* корень */}
      <rect x={368} y={60} width={64} height={38} rx={10} fill={ACCENT} />
      <text x={400} y={87} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>/</text>
      {/* каталоги первого уровня */}
      <g fill={SOFT} stroke={INK} strokeWidth={2.5}>
        <rect x={165} y={156} width={130} height={40} rx={10} />
        <rect x={345} y={156} width={110} height={40} rx={10} />
        <rect x={495} y={156} width={110} height={40} rx={10} />
      </g>
      <g textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>
        <text x={230} y={183}>home</text>
        <text x={400} y={183}>etc</text>
        <text x={550} y={183}>var</text>
      </g>
      {/* домашний каталог с домиком */}
      <rect x={140} y={236} width={180} height={52} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <g strokeLinejoin="round">
        <path d="M158 262l16-14 16 14" fill="none" stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
        <path d="M162 262v14h24v-14" fill="none" stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      </g>
      <text x={252} y={270} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>student</text>
      <circle cx={344} cy={240} r={18} fill={ACCENT} />
      <text x={344} y={250} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>~</text>
      <text x={378} y={247} fontSize={15} fill={FADE}>= /home/student</text>
    </Panel>
  ),
  /* цепь из 3 блоков: data / prevHash / hash */
  'blockchain-chain': (aria) => (
    <Panel id="fig-g-chain" w={800} h={300} aria={aria}>
      {[
        { x: 40, n: 1, prev: '—', hash: 'a1b2…' },
        { x: 300, n: 2, prev: 'a1b2…', hash: 'c3d4…' },
        { x: 560, n: 3, prev: 'c3d4…', hash: 'e5f6…' },
      ].map((b) => (
        <g key={b.n}>
          <rect x={b.x} y={60} width={200} height={185} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={b.x + 100} y={94} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff">{`блок #${b.n}`}</text>
          <path d={`M${b.x + 16} 108h168`} stroke={FADE} strokeWidth={2} />
          <g fontSize={16} fontFamily={MONO}>
            <text x={b.x + 20} y={140} fill={FADE}>data: <tspan fill="#fff">…</tspan></text>
            <text x={b.x + 20} y={175} fill={FADE}>prevHash: <tspan fill={b.n === 1 ? '#fff' : ACCENT} fontWeight={700}>{b.prev}</tspan></text>
            <text x={b.x + 20} y={220} fill={FADE}>hash: <tspan fill={ACCENT} fontWeight={700}>{b.hash}</tspan></text>
          </g>
        </g>
      ))}
      <g fill="none" stroke={ACCENT} strokeWidth={4} strokeLinecap="round">
        <path d="M232 214c40 0 28 -44 62 -44" />
        <path d="M294 170l-12 -2m12 2l-8 10" />
        <path d="M492 214c40 0 28 -44 62 -44" />
        <path d="M554 170l-12 -2m12 2l-8 10" />
      </g>
      <text x={400} y={282} textAnchor="middle" fontSize={15} fill={FADE}>hash блока копируется в prevHash следующего — это и есть «цепь»</text>
    </Panel>
  ),
  /* Column / Row / Box */
  'compose-layout': (aria) => (
    <Panel id="fig-g-compose" w={800} h={270} aria={aria}>
      {/* Column */}
      <rect x={80} y={45} width={140} height={155} rx={12} fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={2.5} />
      <rect x={95} y={60} width={110} height={32} rx={7} fill={ACCENT} />
      <rect x={95} y={102} width={110} height={32} rx={7} fill={SOFT} />
      <rect x={95} y={144} width={110} height={32} rx={7} fill={SOFT} />
      <Arrow x1={240} y1={70} x2={240} y2={180} color={FADE} w={4} />
      <text x={150} y={232} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>{'Column { }'}</text>
      {/* Row */}
      <rect x={335} y={68} width={160} height={110} rx={12} fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={2.5} />
      <rect x={350} y={83} width={38} height={80} rx={7} fill={ACCENT} />
      <rect x={396} y={83} width={38} height={80} rx={7} fill={SOFT} />
      <rect x={442} y={83} width={38} height={80} rx={7} fill={SOFT} />
      <Arrow x1={350} y1={198} x2={480} y2={198} color={FADE} w={4} />
      <text x={415} y={232} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>{'Row { }'}</text>
      {/* Box */}
      <rect x={590} y={55} width={150} height={140} rx={12} fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={2.5} />
      <rect x={610} y={75} width={85} height={72} rx={7} fill={SOFT} stroke={INK} strokeWidth={2} />
      <rect x={636} y={101} width={85} height={72} rx={7} fill={ACCENT} opacity={0.92} />
      <text x={665} y={232} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>{'Box { }'}</text>
    </Panel>
  ),
  /* :app → :ui-kit → :net */
  'ui-kit-modules': (aria) => (
    <Panel id="fig-g-modules" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GRADLE · МОДУЛИ</text>
      <rect x={60} y={80} width={160} height={90} rx={14} fill={ACCENT} />
      <text x={140} y={132} textAnchor="middle" fontSize={24} fontWeight={800} fill={DARK} fontFamily={MONO}>:app</text>
      <rect x={320} y={80} width={160} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={400} y={132} textAnchor="middle" fontSize={24} fontWeight={800} fill="#fff" fontFamily={MONO}>:ui-kit</text>
      <rect x={580} y={80} width={160} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={660} y={132} textAnchor="middle" fontSize={24} fontWeight={800} fill="#fff" fontFamily={MONO}>:net</text>
      <Arrow x1={228} y1={125} x2={312} y2={125} color={INK} w={5} />
      <text x={270} y={104} textAnchor="middle" fontSize={12} fill={FADE} fontFamily={MONO}>implementation</text>
      <Arrow x1={488} y1={125} x2={572} y2={125} color={INK} w={5} />
      <text x={530} y={104} textAnchor="middle" fontSize={12} fill={FADE} fontFamily={MONO}>api | impl</text>
      <g textAnchor="middle" fontSize={15} fill={FADE}>
        <text x={140} y={205}>экраны приложения</text>
        <text x={400} y={205}>дизайн-система</text>
        <text x={660} y={205}>сеть</text>
      </g>
    </Panel>
  ),
  /* Super → Activities + snapping Super+←/→ */
  'ubuntu-windows': (aria) => (
    <Panel id="fig-g-ubuntu" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>UBUNTU · ОКНА ЗА 1 МИНУТУ</text>
      <rect x={60} y={70} width={300} height={170} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <rect x={60} y={70} width={300} height={26} rx={10} fill={ACCENT} />
      <rect x={440} y={70} width={300} height={170} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} strokeDasharray="8 6" />
      <rect x={440} y={70} width={300} height={26} rx={10} fill="rgba(255,255,255,0.3)" />
      <Arrow x1={366} y1={155} x2={434} y2={155} color={ACCENT} w={5} />
      <text x={400} y={196} textAnchor="middle" fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO}>Super+→</text>
      <text x={210} y={264} textAnchor="middle" fontSize={16} fontWeight={600} fill="#fff">окно A</text>
      <text x={590} y={264} textAnchor="middle" fontSize={16} fontWeight={600} fill="#fff">окно B</text>
      <rect x={300} y={100} width={200} height={40} rx={10} fill="rgba(0,0,0,0.32)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={400} y={126} textAnchor="middle" fontSize={16} fontWeight={800} fill={ACCENT} fontFamily={MONO}>Super = Activities</text>
    </Panel>
  ),
  /* дерево TS-проекта контракта (npm create we-contract) в панели Project слева, contract.ts открыт справа */
  'webstorm-project-tree': (aria) => (
    <Panel id="fig-g-webstorm" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>WEBSTORM · PROJECT</text>
      {/* левая панель — дерево проекта */}
      <rect x={30} y={64} width={330} height={230} rx={10} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <g fontFamily={MONO} fontSize={16}>
        <text x={50} y={92} fill="#fff" fontWeight={700}>▾ my-contract</text>
        <path d="M62 100v176" stroke={FADE} strokeWidth={1.5} />
        <text x={76} y={118} fill={FADE}>▸ node_modules</text>
        <text x={76} y={144} fill="#fff" fontWeight={700}>▾ src</text>
        <path d="M88 152v22" stroke={FADE} strokeWidth={1.5} />
        <rect x={100} y={162} width={168} height={28} rx={6} fill={ACCENT} />
        <text x={112} y={181} fill={DARK} fontWeight={800}>contract.ts</text>
        <text x={76} y={214} fill="#fff">contract.config.js</text>
        <text x={76} y={240} fill="#fff">package.json</text>
        <text x={76} y={266} fill="#fff">tsconfig.json</text>
      </g>
      {/* стрелка от открытого файла к редактору справа */}
      <Arrow x1={272} y1={176} x2={392} y2={130} color={ACCENT} w={4} />
      {/* правая панель — редактор с декораторами контракта */}
      <rect x={400} y={64} width={370} height={230} rx={10} fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={2.5} />
      <rect x={400} y={64} width={370} height={30} rx={10} fill={SOFT} />
      <text x={416} y={85} fontFamily={MONO} fontSize={14} fill="#fff" fontWeight={700}>contract.ts</text>
      <g fontFamily={MONO} fontSize={15}>
        <text x={418} y={126} fill={ACCENT} fontWeight={800}>@Contract()</text>
        <text x={418} y={150} fill="#fff">export default class MyContract {'{'}</text>
        <text x={434} y={176} fill={ACCENT} fontWeight={800}>@Var()<tspan fill="#fff" fontWeight={400}> counter!: ContractValue&lt;number&gt;</tspan></text>
        <text x={434} y={202} fill={ACCENT} fontWeight={800}>@Action()<tspan fill="#fff" fontWeight={400}> increment(...) {'{'}</tspan></text>
        <text x={418} y={228} fill="#fff">{'}'}</text>
      </g>
      <text x={585} y={272} textAnchor="middle" fontSize={13} fill={FADE}>декораторы SDK — прямо в редакторе, без переключения окон</text>
    </Panel>
  ),
};

export const SCHEME_IDS = Object.keys(SCHEMES);

export default function Figure({
  scheme, img, alt, caption, source, children,
}: {
  /** id встроенной SVG-схемы (стиль обложек) */
  scheme?: string;
  /** путь к картинке в static, например /img/photos/typing.jpg */
  img?: string;
  alt?: string;
  caption: string;
  /** источник/лицензия для фото */
  source?: string;
  children?: React.ReactNode;
}) {
  const imgUrl = useBaseUrl(img ?? '/');
  return (
    <figure className="fig">
      <div className="fig-media">
        {scheme && SCHEMES[scheme] ? SCHEMES[scheme](caption) : null}
        {img ? <img src={imgUrl} alt={alt ?? caption} loading="lazy" /> : null}
        {children}
      </div>
      <figcaption className="fig-caption">
        {caption}
        {source ? <span className="fig-source">{source}</span> : null}
      </figcaption>
    </figure>
  );
}
