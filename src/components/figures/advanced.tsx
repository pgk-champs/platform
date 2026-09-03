import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы отдельных тем: rebase, регулярные выражения, SSH. */

export const advancedSchemes: Schemes = {
  /* форма истории: merge оставляет развилку, rebase распрямляет */
  'merge-vs-rebase': (aria) => (
    <Panel id="fig-adv-mvr" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>MERGE ПРОТИВ REBASE · ФОРМА ИСТОРИИ</text>
      <text x={40} y={82} fontSize={16} fontWeight={700} fill="#fff">merge</text>
      <path d="M90 120H720" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M220 120C260 120 260 76 320 76H420C480 76 480 120 540 120" stroke={ACCENT} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={140} cy={120} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={220} cy={120} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={370} cy={76} r={10} fill="none" stroke={ACCENT} strokeWidth={4} />
      <circle cx={540} cy={120} r={14} fill={ACCENT} />
      <circle cx={650} cy={120} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <text x={540} y={150} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#fff">merge-коммит, два родителя</text>
      <text x={40} y={206} fontSize={16} fontWeight={700} fill="#fff">rebase</text>
      <path d="M90 244H720" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx={140} cy={244} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={220} cy={244} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={370} cy={244} r={10} fill="none" stroke={ACCENT} strokeWidth={4} />
      <circle cx={480} cy={244} r={10} fill="none" stroke={ACCENT} strokeWidth={4} />
      <circle cx={650} cy={244} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <text x={425} y={274} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={ACCENT}>копии с новым хешем — прямая линия, без развилки</text>
    </Panel>
  ),
  /* rebase не двигает коммиты — создаёт их копии на новой базе */
  'rebase-copies': (aria) => (
    <Panel id="fig-adv-copies" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>REBASE · КОПИРУЕТ, А НЕ ПЕРЕМЕЩАЕТ</text>
      <text x={40} y={80} fontSize={14} fontWeight={700} fill="#fff">было: main</text>
      <path d="M180 90H480" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx={220} cy={90} r={10} fill={INK} />
      <text x={40} y={140} fontSize={14} fontWeight={700} fill="#fff">твоя ветка</text>
      <path d="M220 90C220 128 260 150 300 150" stroke={FADE} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M300 150H480" stroke={FADE} strokeWidth={3} fill="none" />
      <circle cx={360} cy={150} r={9} fill="none" stroke={FADE} strokeWidth={3} />
      <circle cx={440} cy={150} r={9} fill="none" stroke={FADE} strokeWidth={3} />
      <text x={400} y={176} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={FADE}>a1f9c3d · 4e21b77</text>
      <text x={40} y={222} fontSize={14} fontWeight={700} fill="#fff">после git rebase main</text>
      <path d="M180 232H760" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx={220} cy={232} r={10} fill={INK} />
      <circle cx={340} cy={232} r={10} fill="none" stroke={ACCENT} strokeWidth={4} />
      <circle cx={420} cy={232} r={10} fill="none" stroke={ACCENT} strokeWidth={4} />
      <text x={380} y={210} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>копии, новый хеш</text>
      <circle cx={550} cy={232} r={9} fill="none" stroke={INK} strokeWidth={2.5} strokeDasharray="3 3" opacity={0.5} />
      <text x={630} y={228} fontSize={11.5} fill={FADE}>a1f9c3d, 4e21b77 —</text>
      <text x={630} y={244} fontSize={11.5} fill={FADE}>ничьи, живут в reflog</text>
      <text x={400} y={284} textAnchor="middle" fontSize={13.5} fill={FADE}>rebase создаёт копии твоих коммитов с другим родителем — старые не исчезают мгновенно</text>
    </Panel>
  ),
  /* план: pick/fixup/squash/drop превращают 3 коммита в 2 */
  'interactive-plan': (aria) => (
    <Panel id="fig-adv-plan" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT REBASE -I · ПЛАН</text>
      <text x={150} y={72} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>план</text>
      {['pick a1f9c3d', 'pick 4e21b77', 'pick 90cc102'].map((t, i) => (
        <g key={t}>
          <rect x={40} y={86 + i * 46} width={220} height={36} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={56} y={110 + i * 46} fontSize={13} fontFamily={MONO} fill="#fff">{t}</text>
        </g>
      ))}
      <Arrow x1={270} y1={150} x2={318} y2={150} color={ACCENT} w={4} />
      <text x={294} y={132} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={ACCENT}>правишь слова</text>
      <text x={440} y={72} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>меняешь слова</text>
      <rect x={330} y={86} width={220} height={36} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={346} y={110} fontSize={13} fontFamily={MONO} fill="#fff">pick a1f9c3d</text>
      <rect x={330} y={132} width={220} height={36} rx={8} fill={ACCENT} />
      <text x={346} y={156} fontSize={13} fontFamily={MONO} fontWeight={700} fill={DARK}>fixup 4e21b77</text>
      <rect x={330} y={178} width={220} height={36} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={346} y={202} fontSize={13} fontFamily={MONO} fill="#fff">pick 90cc102</text>
      <Arrow x1={560} y1={150} x2={608} y2={150} color={ACCENT} w={4} />
      <text x={584} y={132} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={ACCENT}>git выполняет</text>
      <text x={700} y={72} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>история</text>
      <rect x={618} y={100} width={162} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x={699} y={126} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">добавил парсер</text>
      <rect x={618} y={154} width={162} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={699} y={180} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">опечатка в README</text>
      <text x={400} y={264} textAnchor="middle" fontSize={13} fill={FADE}>fixup вливает 4e21b77 в предыдущий коммит без своего сообщения — было три коммита, стало два</text>
    </Panel>
  ),
  /* reflog: журнал HEAD, строка ДО rebase лежит ниже rebase (start) */
  'reflog-safety': (aria) => (
    <Panel id="fig-adv-reflog" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT REFLOG · ЖУРНАЛ ПЕРЕМЕЩЕНИЙ HEAD</text>
      <text x={40} y={70} fontSize={12.5} fill={FADE}>новые записи сверху, старые снизу</text>
      <rect x={40} y={82} width={620} height={40} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={56} y={107} fontSize={13} fontFamily={MONO} fill="#fff">{'HEAD@{4}: rebase (start): checkout main'}</text>
      <rect x={40} y={130} width={620} height={44} rx={8} fill={ACCENT} />
      <text x={56} y={157} fontSize={13} fontFamily={MONO} fontWeight={700} fill={DARK}>{'HEAD@{5}: checkout: moving from main to feature'}</text>
      <rect x={40} y={182} width={620} height={40} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={56} y={207} fontSize={13} fontFamily={MONO} fill="#fff">{'HEAD@{6}: commit: правка в main'}</text>
      <text x={672} y={158} fontSize={13} fontWeight={800} fill={ACCENT}>← сюда</text>
      <Arrow x1={24} y1={246} x2={24} y2={158} color={ACCENT} w={4} />
      <rect x={40} y={250} width={330} height={40} rx={8} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={2} />
      <text x={56} y={275} fontSize={13} fontFamily={MONO} fontWeight={700} fill={ACCENT}>{'git reset --hard HEAD@{5}'}</text>
      <text x={400} y={302} textAnchor="middle" fontSize={13} fill={FADE}>rebase (start) — уже первый шаг rebase; состояние ветки ДО него записано строкой ниже</text>
    </Panel>
  ),
  /* grep сравнивает с шаблоном каждую строку файла по отдельности */
  'grep-line-scan': (aria) => (
    <Panel id="fig-adv-scan" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GREP · ИДЁТ ПО СТРОКАМ ОДНА ЗА ДРУГОЙ</text>
      <text x={40} y={68} fontSize={13} fontFamily={MONO} fill={ACCENT} fontWeight={700}>шаблон: error</text>
      <rect x={40} y={80} width={430} height={200} rx={12} fill="rgba(0,0,0,0.2)" stroke={INK} strokeWidth={2.5} />
      <text x={56} y={102} fontSize={12} fontWeight={700} fill="#fff">app.log</text>
      {[
        { t: '2026-01-02 INFO start', ok: false },
        { t: '2026-01-02 INFO ready', ok: false },
        { t: '2026-01-03 error: timeout', ok: true },
        { t: '2026-01-04 INFO ok', ok: false },
        { t: '2026-01-05 INFO done', ok: false },
      ].map((row, i) => (
        <g key={row.t}>
          {row.ok ? <rect x={54} y={114 + i * 32} width={402} height={26} rx={6} fill={ACCENT} /> : null}
          <text x={64} y={132 + i * 32} fontSize={12} fontFamily={MONO} fill={row.ok ? DARK : FADE} fontWeight={row.ok ? 700 : 400}>{row.t}</text>
        </g>
      ))}
      <Arrow x1={480} y1={191} x2={556} y2={191} color={ACCENT} w={5} />
      <rect x={566} y={165} width={194} height={52} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={663} y={185} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">напечатано:</text>
      <text x={663} y={205} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>…error: timeout</text>
      <text x={400} y={274} textAnchor="middle" fontSize={13} fill={FADE}>grep сравнивает с шаблоном каждую строку отдельно — совпавшую печатает, остальные молча пропускает</text>
    </Panel>
  ),
  /* анатомия ^[0-9]{3}-[0-9]{2}: якорь, класс+квантификатор, литерал, класс+квантификатор */
  'regex-anatomy': (aria) => (
    <Panel id="fig-adv-anatomy" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>{'АНАТОМИЯ ШАБЛОНА · ^[0-9]{3}-[0-9]{2}'}</text>
      {[
        { sym: '^', t1: 'якорь', t2: 'начало строки' },
        { sym: '[0-9]{3}', t1: 'класс + квантификатор', t2: 'три цифры подряд' },
        { sym: '-', t1: 'литерал', t2: 'обычный дефис' },
        { sym: '[0-9]{2}', t1: 'класс + квантификатор', t2: 'ещё две цифры' },
      ].map((p, i) => {
        const x = 40 + i * 190;
        return (
          <g key={p.sym}>
            <rect x={x} y={70} width={170} height={64} rx={12} fill={i % 2 === 1 ? ACCENT : SOFT} stroke={i % 2 === 1 ? 'none' : INK} strokeWidth={2.5} />
            <text x={x + 85} y={112} textAnchor="middle" fontSize={20} fontWeight={800} fontFamily={MONO} fill={i % 2 === 1 ? DARK : '#fff'}>{p.sym}</text>
            <text x={x + 85} y={156} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">{p.t1}</text>
            <text x={x + 85} y={176} textAnchor="middle" fontSize={11.5} fill={FADE}>{p.t2}</text>
          </g>
        );
      })}
      <text x={400} y={238} textAnchor="middle" fontSize={13} fill={FADE}>{"grep -E '^[0-9]{3}-[0-9]{2}' codes.txt — четыре разных элемента сцепляются в один шаблон"}</text>
    </Panel>
  ),
  /* ^ и $ — позиции, а не символы */
  'anchor-position': (aria) => (
    <Panel id="fig-adv-anchor" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЯКОРЯ · ПОЗИЦИЯ, А НЕ СИМВОЛ</text>
      <text x={40} y={90} fontSize={13} fontFamily={MONO} fill={ACCENT} fontWeight={700}>{"grep '^From' mail.txt"}</text>
      <line x1={300} y1={70} x2={300} y2={112} stroke={ACCENT} strokeWidth={3} strokeDasharray="5 4" />
      <path d="M292 78L300 68L308 78" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={314} y={100} fontSize={20} fontWeight={700} fill="#fff" fontFamily={MONO}>From: Alice</text>
      <text x={314} y={128} fontSize={12} fill={ACCENT}>^ — вот здесь, перед первым символом</text>
      <text x={40} y={190} fontSize={13} fontFamily={MONO} fill={ACCENT} fontWeight={700}>{"grep 'done$' tasks.txt"}</text>
      <text x={314} y={200} fontSize={20} fontWeight={700} fill="#fff" fontFamily={MONO}>task done</text>
      <line x1={438} y1={170} x2={438} y2={212} stroke={ACCENT} strokeWidth={3} strokeDasharray="5 4" />
      <path d="M430 212L438 222L446 212" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={314} y={244} fontSize={12} fill={ACCENT}>$ — вот здесь, сразу после последнего</text>
      <text x={400} y={270} textAnchor="middle" fontSize={13} fill={FADE}>^ и $ не совпадают ни с одним символом строки — они утверждают позицию</text>
    </Panel>
  ),
  /* точка/экранирование/классы: . \. [0-9] [^0-9] */
  'char-class': (aria) => (
    <Panel id="fig-adv-class" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТОЧКА И КЛАССЫ СИМВОЛОВ</text>
      {[
        { sym: '.', t1: 'любой один символ', ex: 'соответствует: v, 1, ?' },
        { sym: '\\.', t1: 'буквально точка', ex: 'соответствует: только .' },
        { sym: '[0-9]', t1: 'один символ из набора', ex: 'соответствует: 0…9' },
        { sym: '[^0-9]', t1: 'НЕ из набора', ex: 'соответствует: a, !, _' },
      ].map((p, i) => {
        const x = 40 + i * 190;
        return (
          <g key={p.sym}>
            <rect x={x} y={68} width={170} height={56} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
            <text x={x + 85} y={106} textAnchor="middle" fontSize={20} fontWeight={800} fontFamily={MONO} fill={ACCENT}>{p.sym}</text>
            <text x={x + 85} y={148} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">{p.t1}</text>
            <text x={x + 85} y={176} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={FADE}>{p.ex}</text>
          </g>
        );
      })}
      <text x={400} y={238} textAnchor="middle" fontSize={13} fill={FADE}>точка без экрана — оператор; с обратной косой — обычный символ; крышка первой в скобках — инверсия</text>
    </Panel>
  ),
  /* рукопожатие: challenge подписан приватным, проверен публичным */
  'ssh-handshake': (aria) => (
    <Panel id="fig-adv-handshake" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SSH · РУКОПОЖАТИЕ КЛЮЧАМИ</text>
      <rect x={30} y={70} width={170} height={240} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={115} y={100} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff">твоя машина</text>
      <text x={115} y={124} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>id_ed25519</text>
      <text x={115} y={140} textAnchor="middle" fontSize={11} fill={FADE}>приватный ключ</text>
      <rect x={600} y={70} width={170} height={240} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={685} y={100} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff">сервер</text>
      <text x={685} y={124} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>authorized_keys</text>
      <text x={685} y={140} textAnchor="middle" fontSize={11} fill={FADE}>твой публичный внутри</text>
      <Arrow x1={210} y1={170} x2={590} y2={170} color={INK} w={4} />
      <text x={400} y={162} textAnchor="middle" fontSize={12} fill="#fff">1. «пускаю как student?»</text>
      <Arrow x1={590} y1={210} x2={210} y2={210} color={INK} w={4} />
      <text x={400} y={202} textAnchor="middle" fontSize={12} fill="#fff">2. случайный вызов (challenge)</text>
      <Arrow x1={210} y1={250} x2={590} y2={250} color={ACCENT} w={4} />
      <text x={400} y={242} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT}>3. подпись вызова приватным ключом</text>
      <Arrow x1={590} y1={290} x2={210} y2={290} color={ACCENT} w={4} />
      <text x={400} y={282} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT}>4. подпись верна публичным → вход разрешён</text>
      <text x={400} y={324} textAnchor="middle" fontSize={13} fill={FADE}>приватный ключ подписывает вызов; сервер проверяет подпись публичным — сам приватный ключ по сети не передаётся</text>
    </Panel>
  ),
  /* приватный дома с правами 600, публичный уезжает в authorized_keys */
  'ssh-key-locations': (aria) => (
    <Panel id="fig-adv-keyloc" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>~/.SSH · ГДЕ ЛЕЖАТ КЛЮЧИ</text>
      <rect x={30} y={64} width={380} height={220} rx={14} fill="rgba(0,0,0,0.2)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>~/.ssh/ — твоя машина</text>
      <FileIcon x={54} y={100} />
      <text x={118} y={124} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>id_ed25519</text>
      <text x={118} y={142} fontSize={11.5} fill={FADE}>приватный · права 600</text>
      <FileIcon x={54} y={172} accent />
      <text x={118} y={196} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>id_ed25519.pub</text>
      <text x={118} y={214} fontSize={11.5} fill={FADE}>публичный · права 644</text>
      <text x={54} y={260} fontSize={12} fontFamily={MONO} fill={FADE}>config · known_hosts — тоже здесь</text>
      <rect x={470} y={120} width={300} height={110} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <FileIcon x={494} y={144} accent />
      <text x={558} y={168} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>authorized_keys</text>
      <text x={558} y={186} fontSize={11.5} fill={FADE}>сервер · список впущенных</text>
      <text x={558} y={202} fontSize={11.5} fill={FADE}>публичных ключей</text>
      <Arrow x1={412} y1={182} x2={465} y2={172} color={ACCENT} w={4} />
      <text x={438} y={158} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily={MONO} fill={ACCENT}>ssh-copy-id</text>
      <text x={400} y={302} textAnchor="middle" fontSize={13} fill={FADE}>приватный остаётся дома под правами 600; публичный уезжает в authorized_keys на каждый сервер</text>
    </Panel>
  ),
  /* ssh-agent: passphrase один раз, дальше подключения без вопросов */
  'ssh-agent-flow': (aria) => (
    <Panel id="fig-adv-agent" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SSH-AGENT · СПРОСИТЬ ОДИН РАЗ ЗА СЕАНС</text>
      <text x={40} y={78} fontSize={13} fontWeight={700} fill={FADE}>без агента — вопрос при каждом подключении</text>
      {[0, 1, 2].map((i) => (
        <g key={`no-agent-${i}`}>
          <rect x={40 + i * 180} y={90} width={150} height={46} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={115 + i * 180} y={110} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">git push</text>
          <text x={115 + i * 180} y={128} textAnchor="middle" fontSize={11} fill={FADE}>passphrase?</text>
        </g>
      ))}
      <text x={40} y={182} fontSize={13} fontWeight={700} fill={FADE}>с агентом — спросит один раз</text>
      <rect x={40} y={196} width={140} height={46} rx={10} fill={ACCENT} />
      <text x={110} y={224} textAnchor="middle" fontSize={13} fontWeight={800} fontFamily={MONO} fill={DARK}>ssh-add</text>
      <Arrow x1={190} y1={219} x2={250} y2={219} color={ACCENT} w={4} />
      <rect x={260} y={196} width={150} height={46} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={335} y={216} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">агент держит ключ</text>
      <text x={335} y={232} textAnchor="middle" fontSize={11} fill={FADE}>в памяти</text>
      <Arrow x1={420} y1={219} x2={470} y2={219} color={ACCENT} w={4} />
      {[0, 1, 2].map((i) => (
        <g key={`agent-${i}`}>
          <rect x={480 + i * 100} y={196} width={82} height={46} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={521 + i * 100} y={226} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">push</text>
          <path d={`M${503 + i * 100} 208L${511 + i * 100} 216L${526 + i * 100} 200`} stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <text x={400} y={264} textAnchor="middle" fontSize={13} fill={FADE}>ssh-add расшифровывает ключ один раз за сеанс — дальше подключения проходят без вопросов</text>
    </Panel>
  ),
  /* config: алиас Host тянет за собой IdentityFile — свой ключ на каждый сервер */
  'ssh-config-alias': (aria) => (
    <Panel id="fig-adv-config" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>~/.SSH/CONFIG · СВОЙ КЛЮЧ НА КАЖДЫЙ ХОСТ</text>
      <rect x={40} y={70} width={190} height={50} rx={10} fill={ACCENT} />
      <text x={135} y={101} textAnchor="middle" fontSize={16} fontWeight={800} fontFamily={MONO} fill={DARK}>Host champ</text>
      <Arrow x1={230} y1={95} x2={306} y2={95} color={ACCENT} w={4} />
      <text x={316} y={100} fontSize={13.5} fontFamily={MONO} fill="#fff">IdentityFile champ_key</text>
      <Arrow x1={552} y1={95} x2={620} y2={95} color={ACCENT} w={4} />
      <rect x={630} y={70} width={140} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={700} y={101} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">192.168.1.10</text>
      <rect x={40} y={170} width={190} height={50} rx={10} fill={ACCENT} />
      <text x={135} y={201} textAnchor="middle" fontSize={15} fontWeight={800} fontFamily={MONO} fill={DARK}>Host github.com</text>
      <Arrow x1={230} y1={195} x2={306} y2={195} color={ACCENT} w={4} />
      <text x={316} y={200} fontSize={13.5} fontFamily={MONO} fill="#fff">IdentityFile github_key</text>
      <Arrow x1={562} y1={195} x2={620} y2={195} color={ACCENT} w={4} />
      <rect x={630} y={170} width={140} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={700} y={201} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">github.com</text>
      <text x={400} y={250} textAnchor="middle" fontSize={13} fill={FADE}>ssh читает config по алиасу Host и сам подставляет нужный IdentityFile — короткое имя тянет весь блок</text>
    </Panel>
  ),
};
