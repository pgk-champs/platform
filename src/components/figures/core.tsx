import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы, написанные до разделения по трекам. Новые добавляются в файл своего
 * трека (foundation.tsx / mobile.tsx / blockchain.tsx), а не сюда. */

export const coreSchemes: Schemes = {
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
  /* коммиты-точки и расходящаяся/сходящаяся ветка, цвет = ветка — грамматика learngitbranching */
  'branch-tree': (aria) => (
    <Panel id="fig-g-branch-tree" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT · ВЕТКИ И СЛИЯНИЕ</text>
      <path d="M90 220h620" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path
        d="M250 220C300 220 300 130 360 130H480C540 130 540 220 590 220"
        stroke={ACCENT} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx={130} cy={220} r={13} fill="none" stroke={INK} strokeWidth={5} />
      <circle cx={250} cy={220} r={13} fill="none" stroke={INK} strokeWidth={5} />
      <circle cx={420} cy={220} r={13} fill="none" stroke={INK} strokeWidth={5} />
      <circle cx={690} cy={220} r={13} fill="none" stroke={INK} strokeWidth={5} />
      <circle cx={380} cy={130} r={13} fill="none" stroke={ACCENT} strokeWidth={5} />
      <circle cx={460} cy={130} r={13} fill="none" stroke={ACCENT} strokeWidth={5} />
      <circle cx={590} cy={220} r={17} fill={ACCENT} />
      <text x={130} y={256} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>master</text>
      <text x={420} y={104} textAnchor="middle" fontSize={16} fontWeight={700} fill={ACCENT} fontFamily={MONO}>feature</text>
      <text x={590} y={256} textAnchor="middle" fontSize={14} fontWeight={600} fill="#fff">merge-коммит</text>
      <text x={400} y={286} textAnchor="middle" fontSize={14} fill={FADE}>у коммита слияния два родителя — по одному от каждой ветки; цвет линии = ветка</text>
    </Panel>
  ),
  /* три тройки прав rwx — те же данные, что в калькуляторе прав ниже по главе (644) */
  'rwx-bits': (aria) => (
    <Panel id="fig-g-rwx" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>LINUX · ПРАВА ДОСТУПА rwx</text>
      {[
        { x: 50, name: 'Владелец', bits: [1, 1, 0], digit: 6 },
        { x: 300, name: 'Группа', bits: [1, 0, 0], digit: 4 },
        { x: 550, name: 'Остальные', bits: [1, 0, 0], digit: 4 },
      ].map((col) => (
        <g key={col.name}>
          <rect x={col.x} y={64} width={200} height={172} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={col.x + 100} y={94} textAnchor="middle" fontSize={18} fontWeight={700} fill="#fff">{col.name}</text>
          {(['r', 'w', 'x'] as const).map((ch, i) => (
            <g key={ch}>
              <rect
                x={col.x + 22 + i * 54} y={110} width={46} height={46} rx={9}
                fill={col.bits[i] ? ACCENT : 'none'} stroke={INK} strokeWidth={2.5}
              />
              <text
                x={col.x + 45 + i * 54} y={140} textAnchor="middle" fontSize={20} fontWeight={800} fontFamily={MONO}
                fill={col.bits[i] ? DARK : FADE}
              >{ch}</text>
            </g>
          ))}
          <text x={col.x + 100} y={198} textAnchor="middle" fontSize={30} fontWeight={800} fill={ACCENT} fontFamily={MONO}>{col.digit}</text>
          <text x={col.x + 100} y={222} textAnchor="middle" fontSize={15} fill={FADE} fontFamily={MONO}>
            {col.bits.map((b, i) => (b ? 'rwx'[i] : '-')).join('')}
          </text>
        </g>
      ))}
      <text x={400} y={272} textAnchor="middle" fontSize={22} fontWeight={700} fill="#fff" fontFamily={MONO}>-rw-r--r--</text>
      <text x={400} y={294} textAnchor="middle" fontSize={14} fill={FADE}>chmod 644 · те же три тройки, что и в калькуляторе прав ниже</text>
    </Panel>
  ),
  /* val — запечатанная коробка (переприсвоить нельзя), var — открытая (переписывай сколько угодно) */
  'memory-boxes': (aria) => (
    <Panel id="fig-g-memory" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · val И var — ДВЕ ЯЧЕЙКИ ПАМЯТИ</text>
      <rect x={110} y={90} width={220} height={140} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={220} y={124} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>val x</text>
      <text x={220} y={190} textAnchor="middle" fontSize={36} fontWeight={800} fill={ACCENT} fontFamily={MONO}>5</text>
      <circle cx={300} cy={106} r={24} fill={DARK} stroke={ACCENT} strokeWidth={5} />
      <text x={300} y={115} textAnchor="middle" fontSize={24} fontWeight={800} fill={ACCENT}>×</text>
      <text x={220} y={222} textAnchor="middle" fontSize={14} fontWeight={600} fill="#fff">повторная запись запрещена компилятором</text>
      <rect x={470} y={90} width={220} height={140} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={580} y={124} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>var y</text>
      <text x={545} y={190} textAnchor="end" fontSize={24} fontWeight={800} fill="rgba(255,255,255,0.45)" fontFamily={MONO}>7</text>
      <Arrow x1={556} y1={182} x2={600} y2={182} color={ACCENT} w={4} />
      <text x={610} y={190} textAnchor="start" fontSize={32} fontWeight={800} fill={ACCENT} fontFamily={MONO}>42</text>
      <text x={580} y={222} textAnchor="middle" fontSize={14} fontWeight={600} fill="#fff">переписывается сколько угодно раз</text>
    </Panel>
  ),
  /* функция/лямбда как коробка: вход → тело → выход */
  'lambda-box': (aria) => (
    <Panel id="fig-g-lambda" w={800} h={290} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · ФУНКЦИЯ КАК КОРОБКА</text>
      <text x={110} y={134} textAnchor="middle" fontSize={30} fontWeight={800} fill="#fff" fontFamily={MONO}>x = 4</text>
      <text x={110} y={162} textAnchor="middle" fontSize={14} fill={FADE}>вход</text>
      <Arrow x1={190} y1={130} x2={290} y2={130} color={ACCENT} w={6} />
      <rect x={300} y={80} width={200} height={100} rx={16} fill={ACCENT} />
      <text x={400} y={122} textAnchor="middle" fontSize={20} fontWeight={800} fill={DARK} fontFamily={MONO}>square(x)</text>
      <text x={400} y={150} textAnchor="middle" fontSize={15} fontWeight={600} fill={DARK}>x * x</text>
      <Arrow x1={510} y1={130} x2={610} y2={130} color={ACCENT} w={6} />
      <text x={670} y={134} textAnchor="middle" fontSize={30} fontWeight={800} fill="#fff" fontFamily={MONO}>16</text>
      <text x={670} y={162} textAnchor="middle" fontSize={14} fill={FADE}>выход</text>
      <text x={400} y={228} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff" fontFamily={MONO}>{'{ x -> x * x }'}</text>
      <text x={400} y={256} textAnchor="middle" fontSize={14} fill={FADE}>та же коробка без имени — лямбда: тот же вход → выход, только анонимно</text>
    </Panel>
  ),
  /* List / Map / Set — три разные полки для данных */
  'collections-shelf': (aria) => (
    <Panel id="fig-g-shelf" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · КОЛЛЕКЦИИ — ТРИ ПОЛКИ</text>
      <text x={140} y={78} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" fontFamily={MONO}>List</text>
      <path d="M40 92h200" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {['Алиса', 'Богдан', 'Соня'].map((name, i) => (
        <g key={name}>
          <rect x={44 + i * 65} y={100} width={56} height={72} rx={9} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={72 + i * 65} y={122} textAnchor="middle" fontSize={11} fill={ACCENT} fontFamily={MONO} fontWeight={700}>[{i}]</text>
          <text x={72 + i * 65} y={150} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">{name.slice(0, 5)}</text>
        </g>
      ))}
      <text x={140} y={232} textAnchor="middle" fontSize={13} fill={FADE}>порядок и индекс важны</text>
      <text x={400} y={78} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" fontFamily={MONO}>Map</text>
      <path d="M300 92h200" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {[{ name: 'Алиса', score: 82 }, { name: 'Богдан', score: 91 }, { name: 'Соня', score: 77 }].map((row, i) => (
        <g key={row.name}>
          <rect x={304} y={100 + i * 26} width={90} height={22} rx={6} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={349} y={115.5 + i * 26} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">{row.name}</text>
          <text x={405} y={115.5 + i * 26} fontSize={13} fill={ACCENT} fontFamily={MONO}>→</text>
          <rect x={422} y={100 + i * 26} width={54} height={22} rx={6} fill={ACCENT} />
          <text x={449} y={115.5 + i * 26} textAnchor="middle" fontSize={12} fontWeight={800} fill={DARK} fontFamily={MONO}>{row.score}</text>
        </g>
      ))}
      <text x={400} y={232} textAnchor="middle" fontSize={13} fill={FADE}>доступ по ключу, не по номеру</text>
      <text x={660} y={78} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" fontFamily={MONO}>Set</text>
      <path d="M560 92h200" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx={600} cy={140} r={30} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={600} y={146} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>82</text>
      <circle cx={665} cy={118} r={30} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={665} y={124} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>91</text>
      <circle cx={715} cy={160} r={30} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={715} y={166} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>77</text>
      <circle cx={615} cy={190} r={20} fill="none" stroke={ACCENT} strokeWidth={3} strokeDasharray="4 4" opacity={0.7} />
      <text x={615} y={195} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO} opacity={0.7}>82</text>
      <text x={650} y={232} textAnchor="middle" fontSize={11.5} fill={FADE}>повтор 82 внутрь не попал — набор без дублей</text>
    </Panel>
  ),
  /* Event → State → Recomposition по кругу */
  'state-flow': (aria) => (
    <Panel id="fig-g-stateflow" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · ЦИКЛ СОСТОЯНИЯ</text>
      <circle cx={140} cy={190} r={64} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={140} y={182} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>Event</text>
      <text x={140} y={204} textAnchor="middle" fontSize={12.5} fill={FADE}>onClick</text>
      <circle cx={400} cy={90} r={64} fill={ACCENT} />
      <text x={400} y={82} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>State</text>
      <text x={400} y={104} textAnchor="middle" fontSize={12.5} fill={DARK}>count++</text>
      <circle cx={660} cy={190} r={64} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={660} y={178} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>Recomposition</text>
      <text x={660} y={202} textAnchor="middle" fontSize={12} fill={FADE}>только читающие</text>
      <Arrow x1={198} y1={150} x2={344} y2={110} color={ACCENT} w={5} />
      <Arrow x1={458} y1={112} x2={604} y2={152} color={ACCENT} w={5} />
      <path d="M604 220C480 255 300 255 178 222" fill="none" stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />
      <path d="M178 222l18 -6m-18 6l4 -19" fill="none" stroke={ACCENT} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={400} y={282} textAnchor="middle" fontSize={14} fill={FADE}>нажатие → состояние изменилось → перерисовалось только то, что его читало</text>
    </Panel>
  ),
  /* источник : виновник : суть — анатомия типичного сообщения об ошибке */
  'error-anatomy': (aria) => (
    <Panel id="fig-g-erranatomy" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>АНАТОМИЯ СООБЩЕНИЯ ОБ ОШИБКЕ</text>
      <rect x={40} y={80} width={190} height={70} rx={12} fill={ACCENT} />
      <text x={135} y={122} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>cat</text>
      <text x={40} y={170} fontSize={14} fontWeight={700} fill={ACCENT}>источник</text>
      <text x={40} y={190} fontSize={12.5} fill={FADE}>кто сообщает</text>
      <text x={238} y={122} fontSize={26} fontWeight={800} fill={FADE} fontFamily={MONO}>:</text>
      <rect x={260} y={80} width={280} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={400} y={122} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>report.txt</text>
      <text x={260} y={170} fontSize={14} fontWeight={700} fill="#fff">виновник</text>
      <text x={260} y={190} fontSize={12.5} fill={FADE}>к чему относится проблема</text>
      <text x={548} y={122} fontSize={26} fontWeight={800} fill={FADE} fontFamily={MONO}>:</text>
      <rect x={568} y={80} width={192} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={664} y={112} textAnchor="middle" fontSize={14.5} fontWeight={800} fill="#fff" fontFamily={MONO}>No such file</text>
      <text x={664} y={132} textAnchor="middle" fontSize={14.5} fontWeight={800} fill="#fff" fontFamily={MONO}>or directory</text>
      <text x={568} y={170} fontSize={14} fontWeight={700} fill="#fff">суть</text>
      <text x={568} y={190} fontSize={12.5} fill={FADE}>что именно случилось</text>
      <text x={400} y={228} textAnchor="middle" fontSize={14} fill={FADE}>три части через двоеточие — работает почти для любой ошибки в терминале</text>
    </Panel>
  ),
  /* окно Android Studio: пять панелей на своих местах */
  'android-studio-panels': (aria) => (
    <Panel id="fig-g-aspanels" w={800} h={360} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ANDROID STUDIO · ОКНО ЗА 5 ПАНЕЛЕЙ</text>
      <rect x={40} y={64} width={150} height={180} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={115} y={88} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">Project</text>
      <g fontFamily={MONO} fontSize={11} fill="rgba(255,255,255,0.6)">
        <text x={54} y={112}>▸ manifests</text>
        <text x={54} y={132}>▾ kotlin+java</text>
        <text x={64} y={152}>MainActivity.kt</text>
        <text x={54} y={172}>▸ res</text>
      </g>
      <rect x={200} y={64} width={330} height={180} rx={10} fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={2.5} />
      <text x={215} y={88} fontSize={13} fontWeight={700} fill="#fff">Редактор</text>
      <path d="M215 104h300M215 122h220M215 140h260M215 158h180" stroke="rgba(255,255,255,0.3)" strokeWidth={5} strokeLinecap="round" />
      <circle cx={219} cy={122} r={5} fill={ACCENT} />
      <rect x={548} y={64} width={40} height={180} rx={8} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={568} y={154} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff" transform="rotate(-90 568 154)">Gradle</text>
      <rect x={40} y={260} width={548} height={64} rx={10} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={56} y={288} fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>Terminal</text>
      <text x={150} y={288} fontSize={13} fontWeight={700} fill="rgba(255,255,255,0.55)" fontFamily={MONO}>Logcat</text>
      <text x={56} y={310} fontSize={12} fill="rgba(255,255,255,0.45)" fontFamily={MONO}>$ ./gradlew build</text>
      <text x={400} y={346} textAnchor="middle" fontSize={14} fill={FADE}>Project · Редактор · Gradle · Terminal и Logcat — без них не обойтись в первый день</text>
    </Panel>
  ),
  /* @Preview: код composable → готовая картинка в IDE, без сборки и без эмулятора */
  'compose-preview': (aria) => (
    <Panel id="fig-g-preview" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · @Preview БЕЗ ЭМУЛЯТОРА</text>
      <rect x={50} y={70} width={330} height={175} rx={12} fill="rgba(0,0,0,0.2)" stroke={INK} strokeWidth={2.5} />
      <g fontFamily={MONO} fontSize={14.5}>
        <text x={68} y={100} fill={ACCENT} fontWeight={800}>@Composable</text>
        <text x={68} y={124} fill="#fff">{'fun Greeting(name: String) {'}</text>
        <text x={84} y={148} fill="#fff">Text("Привет, $name!")</text>
        <text x={68} y={172} fill="#fff">{'}'}</text>
        <text x={68} y={204} fill={ACCENT} fontWeight={800}>@Preview<tspan fill="rgba(255,255,255,0.6)" fontWeight={400}>(showBackground = true)</tspan></text>
        <text x={68} y={228} fill={ACCENT} fontWeight={800}>@Composable</text>
      </g>
      <Arrow x1={392} y1={155} x2={452} y2={155} color={ACCENT} w={5} />
      <text x={422} y={138} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>без сборки</text>
      <rect x={470} y={70} width={280} height={175} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <rect x={470} y={70} width={280} height={28} rx={12} fill="rgba(255,255,255,0.16)" />
      <text x={486} y={89} fontSize={12.5} fontWeight={700} fill="#fff" fontFamily={MONO}>GreetingPreview</text>
      <rect x={486} y={116} width={248} height={100} rx={8} fill="#fff" />
      <text x={510} y={172} fontSize={17} fontWeight={700} fill={DARK}>Привет, Олег!</text>
      <text x={400} y={264} textAnchor="middle" fontSize={14} fill={FADE}>Android Studio рисует composable прямо в IDE — эмулятор для этого не нужен</text>
    </Panel>
  ),
  /* dp игнорирует системный размер шрифта, sp растёт вместе с ним */
  'dp-vs-sp': (aria) => (
    <Panel id="fig-g-dpsp" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · dp ПРОТИВ sp</text>
      <text x={400} y={70} textAnchor="middle" fontSize={13} fill={FADE}>настройка «Крупный шрифт» в системе включена →</text>
      <rect x={70} y={96} width={140} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <rect x={92} y={112} width={38} height={38} rx={8} fill={ACCENT} />
      <text x={92} y={182} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>16.dp</text>
      <rect x={280} y={96} width={140} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <rect x={302} y={112} width={38} height={38} rx={8} fill={ACCENT} />
      <text x={302} y={182} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>16.dp</text>
      <text x={245} y={216} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">одинаковый размер — dp настройку шрифта игнорирует</text>
      <line x1={480} y1={80} x2={480} y2={230} stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeDasharray="6 6" />
      <text x={530} y={150} fontSize={18} fontWeight={800} fill="#fff" fontFamily={MONO}>16.sp</text>
      <text x={610} y={172} fontSize={36} fontWeight={800} fill={ACCENT} fontFamily={MONO}>16.sp</text>
      <text x={610} y={216} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">тот же код — sp вырос вместе с системной настройкой</text>
    </Panel>
  ),
  /* .aar = .jar (classes.jar) + ресурсы + манифест; .jar — только скомпилированный код */
  'aar-vs-jar': (aria) => (
    <Panel id="fig-g-aar" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GRADLE · .aar ПРОТИВ .jar</text>
      <rect x={60} y={70} width={220} height={190} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={170} y={100} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" fontFamily={MONO}>.jar</text>
      <rect x={90} y={130} width={160} height={90} rx={10} fill={ACCENT} />
      <text x={170} y={180} textAnchor="middle" fontSize={15} fontWeight={800} fill={DARK} fontFamily={MONO}>classes.jar</text>
      <text x={170} y={244} textAnchor="middle" fontSize={13} fill={FADE}>только скомпилированный код</text>
      <rect x={500} y={70} width={260} height={190} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={630} y={100} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" fontFamily={MONO}>.aar</text>
      <rect x={520} y={112} width={220} height={34} rx={8} fill={ACCENT} />
      <text x={630} y={135} textAnchor="middle" fontSize={13} fontWeight={800} fill={DARK} fontFamily={MONO}>classes.jar</text>
      <rect x={520} y={152} width={105} height={34} rx={8} fill="rgba(255,255,255,0.4)" />
      <text x={572} y={175} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={DARK} fontFamily={MONO}>res/</text>
      <rect x={635} y={152} width={105} height={34} rx={8} fill="rgba(255,255,255,0.4)" />
      <text x={687} y={175} textAnchor="middle" fontSize={11} fontWeight={700} fill={DARK} fontFamily={MONO}>Manifest.xml</text>
      <rect x={520} y={192} width={220} height={26} rx={8} fill="rgba(255,255,255,0.22)" />
      <text x={630} y={210} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" fontFamily={MONO}>R.txt · jni/*.so</text>
      <text x={630} y={244} textAnchor="middle" fontSize={13} fill={FADE}>код плюс всё, что не код</text>
      <Arrow x1={295} y1={160} x2={485} y2={160} color={ACCENT} w={5} />
      <text x={390} y={144} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>+ ресурсы</text>
      <text x={400} y={282} textAnchor="middle" fontSize={14} fill={FADE}>com.android.library собирает .aar; java-library — только .jar</text>
    </Panel>
  ),
};

