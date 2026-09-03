import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы глав 00–03 Фундамента: GitHub с нуля, печать и клавиатура,
 * IT-английский (стартовый словарь + практика), Linux и терминал. */

export const foundationSchemes: Schemes = {
  /* 00-github-start: регистрация — email, пароль, username, код с почты, готово */
  'gh-signup-flow': (aria) => (
    <Panel id="fig-gh-signup" w={800} h={240} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GITHUB · РЕГИСТРАЦИЯ ПО ШАГАМ</text>
      {[
        { x: 30, label: 'Email' },
        { x: 190, label: 'Пароль' },
        { x: 350, label: 'Username' },
        { x: 510, label: 'Код с почты' },
      ].map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={90} width={120} height={70} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={s.x + 60} y={132} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">{s.label}</text>
        </g>
      ))}
      <Arrow x1={150} y1={125} x2={188} y2={125} color={ACCENT} w={4} />
      <Arrow x1={310} y1={125} x2={348} y2={125} color={ACCENT} w={4} />
      <Arrow x1={470} y1={125} x2={508} y2={125} color={ACCENT} w={4} />
      <Arrow x1={630} y1={125} x2={673} y2={125} color={ACCENT} w={4} />
      <circle cx={715} cy={125} r={38} fill={ACCENT} />
      <path d="M698 125l12 13 23-26" fill="none" stroke={DARK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <text x={715} y={188} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">готово</text>
    </Panel>
  ),
  /* 00-github-start: приглашение в организацию (все репозитории) vs в один репозиторий (collaborator) */
  'gh-invite-paths': (aria) => (
    <Panel id="fig-gh-invite" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GITHUB · ДВА ПУТИ ПРИГЛАШЕНИЯ</text>
      <circle cx={110} cy={150} r={46} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={110} y={144} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">ты</text>
      <text x={110} y={163} textAnchor="middle" fontSize={11} fill={FADE} fontFamily={MONO}>invitation</text>
      <Arrow x1={160} y1={125} x2={270} y2={90} color={ACCENT} w={4} />
      <Arrow x1={160} y1={178} x2={270} y2={218} color={ACCENT} w={4} />
      <rect x={278} y={56} width={490} height={100} rx={14} fill={ACCENT} />
      <text x={300} y={92} fontSize={19} fontWeight={800} fill={DARK}>Организация pgk-champs</text>
      <text x={300} y={116} fontSize={14} fill={DARK}>кнопка Join — видишь все репозитории и участников</text>
      <rect x={300} y={124} width={44} height={20} rx={5} fill="rgba(0,0,0,0.22)" />
      <rect x={352} y={124} width={44} height={20} rx={5} fill="rgba(0,0,0,0.22)" />
      <rect x={404} y={124} width={44} height={20} rx={5} fill="rgba(0,0,0,0.22)" />
      <rect x={278} y={200} width={490} height={100} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={300} y={236} fontSize={19} fontWeight={800} fill="#fff">Один репозиторий</text>
      <text x={300} y={260} fontSize={14} fill={FADE}>кнопка Accept invitation — доступ только к нему</text>
      <FileIcon x={690} y={210} accent />
    </Panel>
  ),
  /* 00-github-start: зелёная галочка / красный крестик / жёлтая точка в Actions */
  'gh-check-states': (aria) => (
    <Panel id="fig-gh-checks" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GITHUB ACTIONS · ЗНАЧКИ ПРОВЕРКИ</text>
      <rect x={50} y={64} width={200} height={172} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <circle cx={150} cy={130} r={38} fill={ACCENT} />
      <path d="M132 130l13 14 24-28" fill="none" stroke={DARK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <text x={150} y={198} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">зелёная галочка</text>
      <text x={150} y={222} textAnchor="middle" fontSize={12.5} fill={FADE}>всё прошло — сдано</text>
      <rect x={300} y={64} width={200} height={172} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <circle cx={400} cy={130} r={38} fill="none" stroke={INK} strokeWidth={5} />
      <path d="M384 114l32 32M416 114l-32 32" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <text x={400} y={198} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">красный крестик</text>
      <text x={400} y={222} textAnchor="middle" fontSize={12.5} fill={FADE}>не прошло — открой журнал</text>
      <rect x={550} y={64} width={200} height={172} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <circle cx={650} cy={130} r={38} fill="none" stroke={FADE} strokeWidth={5} strokeDasharray="8 7" />
      <circle cx={650} cy={130} r={12} fill={FADE} />
      <text x={650} y={198} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">жёлтая точка</text>
      <text x={650} y={222} textAnchor="middle" fontSize={12.5} fill={FADE}>ещё идёт — подожди</text>
    </Panel>
  ),
  /* 01-typing: пять рядов клавиатуры, домашний ряд выделен */
  'ty-keyboard-rows': (aria) => (
    <Panel id="fig-ty-rows" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КЛАВИАТУРА · ПЯТЬ РЯДОВ</text>
      {[
        { y: 58, keys: '1 2 3 4 5 6 7 8 9 0 - =', label: 'ряд цифр', accent: false },
        { y: 106, keys: 'Q W E R T Y U I O P [ ]', label: 'верхний буквенный', accent: false },
        { y: 154, keys: 'A S D F G H J K L ;', label: 'домашний ряд', accent: true },
        { y: 202, keys: 'Z X C V B N M , . /', label: 'нижний буквенный', accent: false },
        { y: 250, keys: 'Shift Ctrl Alt Super Tab Enter', label: 'модификаторы', accent: false },
      ].map((r) => (
        <g key={r.label}>
          <rect x={40} y={r.y} width={430} height={38} rx={9} fill={r.accent ? ACCENT : SOFT} stroke={r.accent ? 'none' : INK} strokeWidth={2} />
          <text x={60} y={r.y + 25} fontSize={15} fontFamily={MONO} fontWeight={700} fill={r.accent ? DARK : '#fff'}>{r.keys}</text>
          <text x={490} y={r.y + 25} fontSize={15} fontWeight={r.accent ? 700 : 400} fill={r.accent ? ACCENT : FADE}>{r.label}</text>
        </g>
      ))}
    </Panel>
  ),
  /* 01-typing: Shift+4 в EN раскладке даёт $, в RU — ; (одна и та же клавиша) */
  'ty-layout-mismatch': (aria) => (
    <Panel id="fig-ty-mismatch" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>РАСКЛАДКА · ОДНА КЛАВИША, РАЗНЫЙ СИМВОЛ</text>
      <rect x={310} y={62} width={180} height={64} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={400} y={102} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" fontFamily={MONO}>Shift + 4</text>
      <Arrow x1={360} y1={130} x2={220} y2={190} color={ACCENT} w={4} />
      <Arrow x1={440} y1={130} x2={580} y2={190} color={ACCENT} w={4} />
      <rect x={90} y={196} width={260} height={64} rx={12} fill={ACCENT} />
      <text x={110} y={222} fontSize={14} fontWeight={700} fill={DARK}>EN — латинская</text>
      <text x={110} y={250} fontSize={26} fontWeight={800} fill={DARK} fontFamily={MONO}>$</text>
      <rect x={450} y={196} width={260} height={64} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={470} y={222} fontSize={14} fontWeight={700} fill="#fff">RU — русская</text>
      <text x={470} y={250} fontSize={26} fontWeight={800} fill={ACCENT} fontFamily={MONO}>;</text>
    </Panel>
  ),
  /* 01-typing: физически те же клавиши L S, но в RU раскладке получается «ды» → command not found */
  'ty-wrong-layout-typo': (aria) => (
    <Panel id="fig-ty-typo" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>НЕ ТА РАСКЛАДКА · ОШИБКА В ТЕРМИНАЛЕ</text>
      <rect x={40} y={80} width={190} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={135} y={120} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>L · S</text>
      <text x={135} y={150} textAnchor="middle" fontSize={13} fill={FADE}>те же физические клавиши</text>
      <Arrow x1={238} y1={125} x2={300} y2={125} color={ACCENT} w={5} />
      <rect x={310} y={80} width={190} height={90} rx={14} fill={ACCENT} />
      <text x={405} y={120} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>ды</text>
      <text x={405} y={150} textAnchor="middle" fontSize={13} fill={DARK}>раскладка RU включена</text>
      <Arrow x1={508} y1={125} x2={570} y2={125} color={ACCENT} w={5} />
      <rect x={580} y={80} width={190} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={600} y={116} fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>bash: ды:</text>
      <text x={600} y={140} fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>command not found</text>
      <text x={400} y={222} textAnchor="middle" fontSize={14} fill={FADE}>физические клавиши те же — раскладка решает, какой символ они отправят</text>
    </Panel>
  ),
  /* 02-it-english: шкала серьёзности warning → error → fatal, растущий кружок */
  'en-error-levels': (aria) => (
    <Panel id="fig-en-levels" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>УРОВНИ СЕРЬЁЗНОСТИ СООБЩЕНИЙ</text>
      <path d="M90 215h610" stroke={FADE} strokeWidth={3} strokeLinecap="round" />
      <path d="M700 215l-14 -7m14 7l-14 7" stroke={FADE} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={400} y={242} textAnchor="middle" fontSize={13} fill={FADE}>серьёзность растёт слева направо</text>
      <circle cx={150} cy={140} r={40} fill="none" stroke={INK} strokeWidth={3} />
      <text x={150} y={146} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff" fontFamily={MONO}>warning:</text>
      <text x={150} y={196} textAnchor="middle" fontSize={12.5} fill={FADE}>продолжает работать</text>
      <circle cx={400} cy={128} r={50} fill={SOFT} stroke={INK} strokeWidth={3} />
      <text x={400} y={134} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>error:</text>
      <text x={400} y={192} textAnchor="middle" fontSize={12.5} fill={FADE}>операция остановлена</text>
      <circle cx={660} cy={112} r={60} fill={ACCENT} />
      <text x={660} y={118} textAnchor="middle" fontSize={18} fontWeight={800} fill={DARK} fontFamily={MONO}>fatal:</text>
      <text x={660} y={186} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">прервано полностью</text>
    </Panel>
  ),
  /* 02-it-english: сырое сообщение об ошибке → очищенный поисковый запрос в кавычках с site: */
  'en-search-query-anatomy': (aria) => (
    <Panel id="fig-en-query" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КАК ПРЕВРАТИТЬ ОШИБКУ В ЗАПРОС</text>
      <rect x={40} y={70} width={330} height={110} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={60} y={98} fontSize={13} fill={FADE}>сырое сообщение</text>
      <text x={60} y={126} fontSize={14.5} fontFamily={MONO} fill="rgba(255,255,255,0.4)" textDecoration="line-through">/home/ivanov/lab3:</text>
      <text x={60} y={150} fontSize={14.5} fontFamily={MONO} fontWeight={700} fill="#fff">fatal: not a git</text>
      <text x={60} y={170} fontSize={14.5} fontFamily={MONO} fontWeight={700} fill="#fff">repository</text>
      <Arrow x1={378} y1={125} x2={442} y2={125} color={ACCENT} w={5} />
      <rect x={452} y={70} width={310} height={110} rx={14} fill={ACCENT} />
      <text x={472} y={98} fontSize={13} fontWeight={700} fill={DARK}>поисковый запрос</text>
      <text x={472} y={132} fontSize={15} fontFamily={MONO} fontWeight={800} fill={DARK}>&quot;not a git repository&quot;</text>
      <text x={472} y={158} fontSize={14} fontFamily={MONO} fontWeight={700} fill={DARK}>site:stackoverflow.com</text>
      <text x={400} y={218} textAnchor="middle" fontSize={13} fill={FADE}>свой путь и fatal: убраны — оставлена узнаваемая часть в кавычках</text>
    </Panel>
  ),
  /* 02-it-english: to deny → denied («Permission denied»), to find → found («command not found») */
  'en-participle-forms': (aria) => (
    <Panel id="fig-en-participle" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГЛАГОЛ → ПРИЧАСТИЕ В ОШИБКАХ</text>
      {[
        { y: 72, verb: 'to deny', part: 'denied', phrase: 'Permission denied' },
        { y: 168, verb: 'to find', part: 'found', phrase: 'command not found' },
      ].map((r) => (
        <g key={r.verb}>
          <rect x={40} y={r.y} width={170} height={64} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={125} y={r.y + 40} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff" fontFamily={MONO}>{r.verb}</text>
          <Arrow x1={218} y1={r.y + 32} x2={278} y2={r.y + 32} color={ACCENT} w={4} />
          <rect x={288} y={r.y} width={170} height={64} rx={12} fill={ACCENT} />
          <text x={373} y={r.y + 40} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>{r.part}</text>
          <Arrow x1={466} y1={r.y + 32} x2={526} y2={r.y + 32} color={FADE} w={4} />
          <text x={536} y={r.y + 40} fontSize={17} fontWeight={700} fill="#fff" fontFamily={MONO}>{r.phrase}</text>
        </g>
      ))}
    </Panel>
  ),
  /* 02b-english-practice: ( ) parentheses, { } curly braces, [ ] square brackets */
  'en2-bracket-names': (aria) => (
    <Panel id="fig-en2-brackets" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СКОБКИ ПО-АНГЛИЙСКИ</text>
      {[
        { x: 50, glyph: '( )', name: 'parentheses', ru: 'круглые' },
        { x: 310, glyph: '{ }', name: 'curly braces', ru: 'фигурные' },
        { x: 570, glyph: '[ ]', name: 'square brackets', ru: 'квадратные' },
      ].map((b) => (
        <g key={b.name}>
          <rect x={b.x} y={64} width={200} height={172} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={b.x + 100} y={148} textAnchor="middle" fontSize={44} fontWeight={800} fill={ACCENT} fontFamily={MONO}>{b.glyph}</text>
          <text x={b.x + 100} y={188} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>{b.name}</text>
          <text x={b.x + 100} y={210} textAnchor="middle" fontSize={13} fill={FADE}>{b.ru}</text>
        </g>
      ))}
    </Panel>
  ),
  /* 02b-english-practice: слово «журнал» многозначно, фраза «журнал ошибок сервера» — однозначна */
  'en2-word-vs-phrase': (aria) => (
    <Panel id="fig-en2-wordphrase" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЕРЕВОДИ ФРАЗОЙ, А НЕ СЛОВОМ</text>
      <rect x={40} y={110} width={150} height={60} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={115} y={148} textAnchor="middle" fontSize={18} fontWeight={700} fill="#fff">журнал</text>
      <Arrow x1={198} y1={122} x2={280} y2={80} color={FADE} w={3.5} />
      <Arrow x1={198} y1={158} x2={280} y2={200} color={FADE} w={3.5} />
      <text x={290} y={78} fontSize={15} fontFamily={MONO} fill={FADE}>magazine?</text>
      <text x={290} y={210} fontSize={15} fontFamily={MONO} fill={FADE}>log?</text>
      <text x={115} y={195} textAnchor="middle" fontSize={13} fill={FADE}>слово одно — смыслов много</text>
      <line x1={430} y1={60} x2={430} y2={240} stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="6 6" />
      <rect x={470} y={110} width={290} height={60} rx={12} fill={ACCENT} />
      <text x={615} y={148} textAnchor="middle" fontSize={16} fontWeight={700} fill={DARK}>журнал ошибок сервера</text>
      <Arrow x1={615} y1={178} x2={615} y2={212} color={ACCENT} w={4} />
      <text x={615} y={236} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>server error log</text>
    </Panel>
  ),
  /* 02b-english-practice: написание и звучание расходятся — height/queue/cache */
  'en2-spelling-vs-sound': (aria) => (
    <Panel id="fig-en2-spelling" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КАК ПИШЕТСЯ ≠ КАК ЗВУЧИТ</text>
      {[
        { x: 50, word: 'height', sound: 'хайт' },
        { x: 310, word: 'queue', sound: 'кью' },
        { x: 570, word: 'cache', sound: 'кэш' },
      ].map((w) => (
        <g key={w.word}>
          <rect x={w.x} y={64} width={200} height={172} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={w.x + 100} y={112} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>{w.word}</text>
          <Arrow x1={w.x + 100} y1={128} x2={w.x + 100} y2={168} color={ACCENT} w={4} />
          <text x={w.x + 100} y={206} textAnchor="middle" fontSize={26} fontWeight={800} fill={ACCENT} fontFamily={MONO}>{w.sound}</text>
        </g>
      ))}
    </Panel>
  ),
  /* 02b-english-practice: словарный перевод bough (ботаника) vs проверенный термин branch (git branch) */
  'en2-term-vs-dictionary': (aria) => (
    <Panel id="fig-en2-term" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТЕРМИН СВЕРЯЙ ПО КОДУ, НЕ ПО СЛОВАРЮ</text>
      <rect x={60} y={80} width={300} height={120} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={80} y={110} fontSize={13} fill={FADE}>словарь предлагает</text>
      <text x={80} y={156} fontSize={30} fontWeight={800} fill="rgba(255,255,255,0.4)" fontFamily={MONO} textDecoration="line-through">bough</text>
      <text x={80} y={184} fontSize={12.5} fill={FADE}>«ветвь дерева» — ботаника, не git</text>
      <Arrow x1={368} y1={140} x2={432} y2={140} color={ACCENT} w={5} />
      <rect x={442} y={80} width={300} height={120} rx={14} fill={ACCENT} />
      <text x={462} y={110} fontSize={13} fontWeight={700} fill={DARK}>реальный термин</text>
      <text x={462} y={156} fontSize={30} fontWeight={800} fill={DARK} fontFamily={MONO}>branch</text>
      <text x={462} y={184} fontSize={12.5} fontWeight={700} fill={DARK}>так называется команда git branch</text>
    </Panel>
  ),
  /* 03-linux-terminal: абсолютный путь от / vs относительный путь от текущего каталога */
  'lx-abs-rel-path': (aria) => (
    <Panel id="fig-lx-path" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПУТЬ · АБСОЛЮТНЫЙ ПРОТИВ ОТНОСИТЕЛЬНОГО</text>
      <path d="M104 90h60M264 90h50M424 90h50M584 90h50" stroke={FADE} strokeWidth={3} />
      <rect x={60} y={68} width={44} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={82} y={96} textAnchor="middle" fontSize={18} fontWeight={800} fill="#fff" fontFamily={MONO}>/</text>
      <rect x={164} y={68} width={100} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={214} y={96} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>home</text>
      <rect x={314} y={68} width={110} height={44} rx={10} fill={ACCENT} />
      <text x={369} y={96} textAnchor="middle" fontSize={15} fontWeight={800} fill={DARK} fontFamily={MONO}>student</text>
      <rect x={474} y={68} width={110} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={529} y={96} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>project</text>
      <rect x={634} y={68} width={100} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={684} y={96} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>docs</text>
      <text x={369} y={140} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>▲ текущий каталог (pwd)</text>
      <rect x={60} y={170} width={680} height={52} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={80} y={202} fontSize={17} fontFamily={MONO}><tspan fill={ACCENT} fontWeight={800}>/home/student/</tspan><tspan fill="#fff" fontWeight={700}>project/docs</tspan></text>
      <text x={740} y={202} textAnchor="end" fontSize={13} fill={FADE}>абсолютный: от корня /</text>
      <rect x={60} y={234} width={680} height={52} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={80} y={266} fontSize={17} fontFamily={MONO} fill="#fff" fontWeight={700}>project/docs</text>
      <text x={740} y={266} textAnchor="end" fontSize={13} fill={FADE}>относительный: от текущего места</text>
    </Panel>
  ),
  /* 03-linux-terminal: GUI-удаление → корзина (можно вернуть) vs rm → сразу пропало (нельзя) */
  'lx-rm-no-trash': (aria) => (
    <Panel id="fig-lx-trash" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>В ТЕРМИНАЛЕ НЕТ КОРЗИНЫ</text>
      <FileIcon x={90} y={80} />
      <text x={100} y={182} fontSize={13.5} fontWeight={700} fill="#fff">Delete в проводнике</text>
      <Arrow x1={210} y1={115} x2={300} y2={115} color={INK} w={4} />
      <rect x={310} y={82} width={130} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={375} y={124} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff">Корзина</text>
      <path d="M420 152C460 190 400 210 340 190" fill="none" stroke={ACCENT} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M340 190l-4 -16m4 16l16 -6" fill="none" stroke={ACCENT} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={375} y={222} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ACCENT}>можно вернуть</text>
      <line x1={490} y1={60} x2={490} y2={240} stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="6 6" />
      <FileIcon x={550} y={80} accent />
      <text x={555} y={182} fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>rm report.txt</text>
      <Arrow x1={670} y1={115} x2={725} y2={115} color={INK} w={4} />
      <circle cx={758} cy={115} r={26} fill="none" stroke={INK} strokeWidth={4} />
      <path d="M746 103l24 24M770 103l-24 24" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <text x={700} y={222} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">сразу пропало — не вернуть</text>
    </Panel>
  ),
  /* 03-linux-terminal: Ctrl+C — это не буфер обмена, а сигнал SIGINT работающей программе */
  'lx-ctrlc-sigint': (aria) => (
    <Panel id="fig-lx-sigint" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>Ctrl+C В ТЕРМИНАЛЕ — НЕ КОПИРОВАТЬ</text>
      <rect x={60} y={90} width={190} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={155} y={140} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>Ctrl+C</text>
      <text x={155} y={162} textAnchor="middle" fontSize={12.5} fill={FADE}>не буфер обмена</text>
      <Arrow x1={258} y1={135} x2={340} y2={135} color={ACCENT} w={5} />
      <text x={299} y={118} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>SIGINT</text>
      <rect x={350} y={90} width={280} height={90} rx={14} fill={ACCENT} />
      <text x={372} y={126} fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>ping 127.0.0.1</text>
      <text x={372} y={154} fontSize={16} fontWeight={800} fill={DARK} fontFamily={MONO}>^C <tspan fontSize={13} fontWeight={700}>процесс остановлен</tspan></text>
      <text x={400} y={225} textAnchor="middle" fontSize={13} fill={FADE}>сигнал прерывания жёстко закреплён за этой клавишей в драйвере терминала</text>
    </Panel>
  ),
};
